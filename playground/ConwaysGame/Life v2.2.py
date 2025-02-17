from matplotlib import image
from matplotlib import pyplot
import time
import numpy
import os
import random

#basic variables
width=50
height=50
history_map=[]
current_map=[]
next_map=[]
blank_map=[]
count=0
is_game_continue=True
borad_color=[255,255,255]
cell_color=[0,0,0]
testing=False
max_running_time=1024
path = os.path.dirname(os.path.abspath(__file__))
blank= path + '/' + 'Blank_50x50.png'

def rectangle_seeds(startx,starty,endx,endy):
    new_seeds=[]
    for i in range(startx,starty):
        for j in range(endx,endy):
            new_seeds.append([i,j])
    return new_seeds

def random_seeds(ratio):
    new_seeds=[]
    for i in range(width):
        for j in range(height):
            poisbility=random.random()
            if poisbility<ratio:
                new_seeds.append([i,j])
    return new_seeds

def initialization (width,height):
    global current_map,next_map,blank_map
    current_map=[[0 for i in range(width)] for j in range(height)]
    blank_map=[[0 for i in range(width)] for j in range(height)]
    next_map=blank_map

def is_alive():
    global next_map,current_map,is_game_continue,history_map
    for w in range(width):
        for h in range(height):
            near_by_block=0
            detect_area=[[w+1,h+1],[w+1,h],[w+1,h-1],[w,h+1],[w,h-1],[w-1,h+1],[w-1,h],[w-1,h-1]]
            for i in detect_area:
                if i[0]<width and i[0]>=0 and i[1]<height and i[1]>=0:
                    if current_map[i[1]][i[0]]==1:
                        near_by_block+=1
            
            # Born Value
            if (near_by_block == 3) and current_map[h][w]==0:
                next_map[h][w]=1
            #Survive Value
            elif (near_by_block == 2 or near_by_block == 3) and current_map[h][w]==1:
                next_map[h][w]=1
            else:
                next_map[h][w]=0
    for m in range(len(history_map)):
        if compare_map(next_map,history_map[m]):
            is_game_continue=False
    current_map=next_map
    history_map.append(next_map.copy())
    next_map=[[0 for i in range(width)] for j in range(height)]

def compare_map(a,b):
    for i in range(len(a)):
        for j in range(len(a[i])):
            if a[i][j]!=b[i][j]:
                return False
    return True

def seed(seed_list):
    global current_map
    for i in seed_list:
        current_map[i[1]][i[0]]=1

def board_print(board):
    data = image.imread(blank)
    plot_data = data.copy()
    for h in range(height):
        for w in range(width):
            if current_map[h][w]==1:
                plot_data[w][h] = [cell_color[0],cell_color[1],cell_color[2],1.0]
    time.sleep(1)
    pyplot.imshow(plot_data)

#seeds
seeds0= random_seeds(0.5)
seeds1=[[24,25],[25,24],[25,25],[25,26],[26,24]]
seeds2=[[3,2],[3,3],[3,4]]
seeds3=[[24,24],[24,25],[24,26],[25,25],[26,24]]
seeds4=[[24,23],[24,24],[24,25],[25,23],[25,26],[26,24],[26,25]]
seeds5=rectangle_seeds(25,50,75,51)
seeds=seeds0

initialization(width,height)
seed(seeds)
run_time_count=0
if testing:
    while is_game_continue and run_time_count<max_running_time:
        board_print(current_map)
        is_alive()
        run_time_count+=1
    board_print(current_map)
    print(run_time_count)
else:
    while is_game_continue:
        board_print(current_map)
        is_alive()
        run_time_count+=1
    board_print(current_map)
    print(run_time_count)