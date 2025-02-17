  
from mpl_toolkits import mplot3d
import numpy as np
import matplotlib.pyplot as plt
import random

#basic variables
x=10
y=10
z=10
history_map=[]
current_map=[]
next_map=[]
blank_map=[]
count=0
is_game_continue=True
testing=False
max_running_time=1024
cell_color=[0,0,0]
survive=[2,3]
born=[3,4]



def random_seeds(ratio):
    new_seeds=[]
    for a in range(x):
        for b in range(y):
            for c in range(z):
                poisbility=random.random()
                if poisbility<ratio:
                    new_seeds.append([a,b,c])
    return new_seeds

def initialization ():
    global current_map,next_map,blank_map
    current_map=[[[0 for i in range(z)] for i in range(y)] for j in range(x)]
    blank_map=[[[0 for i in range(z)] for i in range(y)] for j in range(x)]
    next_map=blank_map

def is_alive():
    global next_map,current_map,is_game_continue,history_map
    fig = plt.figure()
    ax = plt.axes(projection="3d")
    ax.set_zlim3d(0, z)                  
    ax.set_ylim3d(0, y)                   
    ax.set_xlim3d(0, x) 
    xdata=[]
    ydata=[]
    zdata=[]
    for a in range(x):
        for b in range(y):
            for c in range(z):
                near_by_block=0
                detect_area=[[a+1,b+1,c+1],[a+1,b+1,c],[a+1,b+1,c-1],\
                             [a+1,b,c+1],[a+1,b,c],[a+1,b,c-1],\
                             [a+1,b-1,c+1],[a+1,b-1,c],[a+1,b-1,c-1],\
                             [a,b+1,c+1],[a,b+1,c],[a,b+1,c-1],\
                             [a,b,c+1],[a,b,c-1],\
                             [a,b-1,c+1],[a,b-1,c],[a,b-1,c-1],\
                             [a-1,b+1,c+1],[a-1,b+1,c],[a-1,b+1,c-1],\
                             [a-1,b,c+1],[a-1,b,c],[a-1,b,c-1],\
                             [a-1,b-1,c+1],[a-1,b-1,c],[a-1,b-1,c-1]]
                for i in detect_area:
                    if i[0]<x and i[0]>=0 and i[1]<y and i[1]>=0 and i[2]<z and i[2]>=0:
                        if current_map[i[0]][i[1]][i[2]] == 1:
                            near_by_block+=1
            
                # Born Value
                if born.count(near_by_block)>0 and current_map[a][b][c]==0:
                    next_map[a][b][c]=1
                    xdata.append(a)
                    ydata.append(b)
                    zdata.append(c)
                #Survive Value
                elif survive.count(near_by_block)>0 and current_map[a][b][c]==1:
                    next_map[a][b][c]=1
                    xdata.append(a)
                    ydata.append(b)
                    zdata.append(c)
                else:
                    next_map[a][b][c]=0

    ax.scatter3D(xdata,ydata,zdata, color = 'blue')
    #ax.scatter3D(a,b,c, c=z_points, cmap='hsv')

    if testing:
        for m in range(len(history_map)):
            if compare_map(next_map,history_map[m]):
                is_game_continue=False
    
    current_map=next_map
    history_map.append(next_map.copy())
    next_map=[[[0 for i in range(z)] for i in range(y)] for j in range(x)]
    plt.show()
    plt.pause(0.001)
    plt.clf()

def compare_map(q,r):
    for a in range(x):
        for b in range(y):
            for c in range(z):
                if q[a][b][c]!=r[a][b][c]:
                    return False
    return True

def seed(seed_list):
    global current_map
    for i in seed_list:
        current_map[i[0]][i[1]][i[2]]=1

#seeds
seeds0= random_seeds(0.1)
seeds=seeds0

initialization()
seed(seeds)
run_time_count=0
while is_game_continue and run_time_count<max_running_time:
    is_alive()
    run_time_count+=1
print(run_time_count)


