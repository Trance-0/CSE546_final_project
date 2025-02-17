import time
second=0
miniute=0
hour=0
day=0
print("press enter to start timing")
s=input()
start_time=time.time()
print("time satrts now, press enter to stop.")
e=input()
second=time.time()-start_time
if second>60:
    miniute=int(second/60)
    second=second%60
    if miniute>60:
        hour=int(miniute/60)
        miniute=miniute%60
        if hour>24:
            day=int(hour/24)
            hour=hour%24
print("You have finish this task in ",day,":",hour,":",miniute,":",second," .")