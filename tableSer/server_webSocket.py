import asyncio
import websockets
import functools
import json
import logging
import sys
from enum import IntEnum
import xlwt
import time
from urllib import parse
from task import *

'''
一个ip+port lock cell
name === ip

x,y --> name //根据总表查
ip+port -> x,y
'''
class Operate(IntEnum):
    lock = 1
    unlock = 2
    change = 3
    download = 4
'''   
class format_data:
    #__slots__ = ("row", "col", "action", "msg")
    def __init__(self):
        self.row = -1
        self.col = -1
        self.action = -1
        self.text = ""
'''        
class cell_info:
    def __init__(self, row, col):
        self.text = ""
        self.name = ""
        self.islock = False
        self.row = row
        self.col = col
        self.action = -1

#初始化log
def init_log():
    '''
    logger.info("Start print log")
    logger.debug("Do something")
    logger.warning("Something maybe fail.")
    logger.info("Finish")
    '''    
    logger = logging.getLogger('websockets.server')
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

log = init_log()
connected = set()
#g_dict_future = dict()
dict_ip_name = {}
dict_ipport_cell = {}

list_table_all = load_table()
if not list_table_all:    
    list_table_all = [[cell_info(j, i).__dict__ for i in range(7)] for j in range(100)]



def get_unique_id(ws):
    return ws.remote_address[0]+":"+str(ws.remote_address[1])

#异常捕获装饰器
def decorate_except(handler):
    log.info("call  decorate_except")
    async def call_handler(*args, **kw):
        ws = args[0]
        try:
            await handler(*args, **kw)
        except websockets.exceptions.ConnectionClosed:
            if ws in connected:
                connected.remove(ws)
                #g_dict_future[get_unique_id(ws)].set_result(get_unique_id(ws))
            if dict_ipport_cell.get(get_unique_id(ws)):
                location = dict_ipport_cell[get_unique_id(ws)]
                list_table_all[location[0]][location[1]]['islock'] = False
                del dict_ipport_cell[get_unique_id(ws)]
            
                cell = cell_info(*location)
     
                cell.action = Operate.unlock
                cell.name = list_table_all[location[0]][location[1]]["name"]
                await asyncio.wait([send_handler(ws, json.dumps(cell.__dict__)) for ws in connected])
                log.info("ConnectionClosed-->ip:%s port:%d name:%s" \
                      %(ws.remote_address[0], ws.remote_address[1], dict_ip_name[ws.remote_address[0]]))
            
            #某人离开 查询是否锁住某个cell如果有 广播释放
            '''
            中途有其他人离开又会引发异常，函数递归调用了，断开连接事件需要特殊处理
            '''                
            
        except asyncio.TimeoutError:
            log.info("timeout")
        finally:
            pass
            
    return call_handler

@decorate_except            
async def process_msg(ws, message):
    #print(message)
    #global max_pos
    mobject = json.loads(message)
    action = mobject['action']
    row = mobject['row']
    col = mobject['col']
    #max_pos = (max(row, max_pos[0]), max(col, max_pos[1]))
    if action == Operate.lock:
        if not list_table_all[row][col]['islock']:
            list_table_all[row][col]['islock'] = True
            list_table_all[row][col]['name'] = dict_ip_name[ws.remote_address[0]]
            await asyncio.wait([send_handler(ws, json.dumps(list_table_all[row][col])) for ws in connected])
            #打开多个网页 特殊处理 设置字典加快索引
            dict_ipport_cell[get_unique_id(ws)] = (row, col)
            print(dict_ipport_cell)
        else:
            mobject['action'] = -1
            await send_handler(ws, json.dumps(list_table_all[row][col]))
            
    elif action == Operate.unlock:
        list_table_all[row][col]['islock'] = False
        list_table_all[row][col]['text'] = mobject['text']
        list_table_all[row][col]['name'] = ''
        consume.put(Task(update_sql, list_table_all))
        await asyncio.wait([send_handler(ws, json.dumps(list_table_all[row][col])) for ws in connected])
    elif action == Operate.change:
        list_table_all[row][col]['text'] = mobject['text']
        '''
        if len(mobject['text'])>10:
            list_table_all[row][col]['text']+='\n'
        '''
        
        list_other_ws = [ws_ for ws_ in connected if ws is not ws_]
        if len(list_other_ws)!=0:
            await asyncio.wait([send_handler(ws, json.dumps(list_table_all[row][col])) for ws in list_other_ws])
    elif action == Operate.download:
        file_name = write_excel(dict_ip_name[ws.remote_address], list_table_all)

        ret_info = cell_info(0, 0)
        ret_info.text = file_name
        ret_info.action = Operate.download
        await ws.send(json.dumps(ret_info.__dict__))
    
@decorate_except
async def send_handler(websocket, msg):    
    await websocket.send(msg)

@decorate_except
async def recv_handler(websocket):
    while True:
        message = await websocket.recv()
        await process_msg(websocket, message)

@decorate_except
async def send_heard_pack(ws):
    while True:
        pong_waiter = await ws.ping()
        await asyncio.wait_for(pong_waiter, timeout=10)

async def process_leave(future):
    await future
    print(future.result())

async def handler(websocket, path, extra_argument):
    global connected
    global g_set_future
    
    dict_ip_name[websocket.remote_address[0]] = parse.unquote(path[1:])
    connected.add(websocket)
    #print(get_unique_id(websocket))
    #tmp_future = asyncio.Future()
    #g_dict_future[get_unique_id(websocket)] = tmp_future
    try:
        #print("process_leave S")
        #await asyncio.shield(process_leave(tmp_future))
        #print("process_leave E")
        await send_handler(websocket, json.dumps(list_table_all))
        #await asyncio.wait([send_handler(ws, " join") for ws in connected])
        #await asyncio.wait([send_heard_pack(ws) for ws in connected])
        await recv_handler(websocket)
        #await asyncio.wait([recv_handler(ws) for ws in connected])

        log.debug("online:"+str(len(connected)))
        await asyncio.sleep(10)
    except websockets.exceptions.ConnectionClosed:
        log.debug(websocket.remote_address)
    except asyncio.TimeoutError:
        log.warning("timeout")
    finally:
        # Unregister.
        #log.info(websocket.remote_address, dict_ip_name[websocket.remote_address])
        if websocket in connected:
            connected.remove(websocket)
            #g_dict_future[get_unique_id(websocket)].set_result(get_unique_id(websocket))


if "__main__"==__name__:
    bound_handler = functools.partial(handler, extra_argument='spam')
    start_server = websockets.serve(bound_handler, '0.0.0.0', 9000)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()




        
