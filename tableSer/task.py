import threading
import queue
import pickle
import xlwt
import time
class Task:
    def __init__(self, func, *argv):
        self.func = func
        self.argv = argv
    def __call__(self):
        try:
            self.func(*(self.argv))
        except TypeError as e:
            print(e)

def update_sql(table):
    try:
        with open("pickle.db", "wb") as f:
            pickle.dump(table, f)
    except FileNotFoundError as e:
        print(e)
    except pickle.PickleError as e:
        print(e)
def load_table():
    try:
        with open("pickle.db", "rb+") as f:
            return pickle.load(f)
    except FileNotFoundError as e:
        print(e)
        return None
    except pickle.PickleError as e:
        print(e)
        return None
class Consume(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self._queue = queue.Queue(0)
        self.start()
    def run(self):
        while True:
            task = self._queue.get()            
            task()
            if None == task:
                print("break")
                break

    def put(self, task):
        self._queue.put(task)
    def get(self):
        print(self._queue.get())
def write_excel(name, table):
    wbk = xlwt.Workbook()
    sheet = wbk.add_sheet('sheet 1')

    pattern = xlwt.Pattern() # Create the Pattern
    pattern.pattern = xlwt.Pattern.SOLID_PATTERN # May be: NO_PATTERN, SOLID_PATTERN, or 0x00 through 0x12
    pattern.pattern_fore_colour = 3 # May be: 8 through 63. 0 = Black, 1 = White, 2 = Red, 3 = Green, 4 = Blue, 5 = Yellow, 6 = Magenta, 7 = Cyan, 16 = Maroon, 17 = Dark Green, 18 = Dark Blue, 19 = Dark Yellow , almost brown), 20 = Dark Magenta, 21 = Teal, 22 = Light Gray, 23 = Dark Gray, the list goes on...
    style = xlwt.XFStyle() # Create the Pattern
    style.pattern = pattern # Add Pattern to Style
    
    list_head = ["编号", "负责人", "崩溃次数", "来源", "栈信息", "修复说明", "操作"]
    sheet.col(4).width = 5000
    for i in range(len(list_head)):
        sheet.write(0, i, list_head[i], style)
    for i in range(100):
        for j in range(7):
            sheet.write(i+1, j, table[i][j]["text"])
    time_point = time.strftime('%Y-%m-%d-%H-%M-%S',time.localtime(time.time()))
    file_name = time_point+name+'.xls'
    wbk.save('./tableSer/'+file_name)
    #wbk.save(file_name)
    return file_name
consume = Consume()



'''
import xlwt
workbook = xlwt.Workbook()
worksheet = workbook.add_sheet('My Sheet')
pattern = xlwt.Pattern() # Create the Pattern
pattern.pattern = xlwt.Pattern.SOLID_PATTERN # May be: NO_PATTERN, SOLID_PATTERN, or 0x00 through 0x12
pattern.pattern_fore_colour = 3 # May be: 8 through 63. 0 = Black, 1 = White, 2 = Red, 3 = Green, 4 = Blue, 5 = Yellow, 6 = Magenta, 7 = Cyan, 16 = Maroon, 17 = Dark Green, 18 = Dark Blue, 19 = Dark Yellow , almost brown), 20 = Dark Magenta, 21 = Teal, 22 = Light Gray, 23 = Dark Gray, the list goes on...
style = xlwt.XFStyle() # Create the Pattern
style.pattern = pattern # Add Pattern to Style
worksheet.write(0, 0, 'Cell Contents', style)
workbook.save('Excel_Workbook.xls')
'''


