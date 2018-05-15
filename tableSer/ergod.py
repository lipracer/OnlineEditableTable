import os
import sys
f = open("ret.txt", "wt")
sys.stdout = f
def output(msg):
    print(msg)
    f.flush()
def ergod(path):
    if len(path.split('/'))>10:
        return
    if os.path.isfile(path):
        output(path)
        return
    try:
        for i in os.listdir(path):
            if os.path.isfile(i):
                output(path + "/" + i)
            else:
                ergod(os.path.join(path, i))
    except NotADirectoryError as e:
        output(e)
    except FileNotFoundError as e:
        output(e)
    except BaseException as e:
        output(e)        
ergod("./")
