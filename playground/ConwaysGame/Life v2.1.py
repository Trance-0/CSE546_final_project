from matplotlib import image
from matplotlib import pyplot
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
print_method="picture"
is_game_continue=True
borad_color=[255,255,255]
cell_color=[0.0,0.0,0.0]
testing=False
run_time_count=0
max_running_time=100
detect_area=[[1,1],[1,0],[1,-1],[0,1],[0,1],[-1,1],[-1,0],[-1,-1]]
born=[3]
survive=[2,3]
path = os.path.dirname(os.path.abspath(__file__))
blank= path + '/' + 'Blank_50x50.png'

def rectangle_seeds(startx,starty,endx,endy):
	rectangle_seeds=[]
	for i in range(startx,starty):
		for j in range(endx,endy):
			rectangle_seeds.append([i,j])
	return rectangle_seeds

def random_seeds(ratio):
	random_seeds=[]
	for i in range(width):
		for j in range(height):
			poisbility=random.random()
			if poisbility < ratio:
				random_seeds.append([i,j])
	return random_seeds

def initialization (width,height):
	global current_map,next_map,blank_map
	current_map=[[0 for i in range(width)] for j in range(height)]
	blank_map=[[0 for i in range(width)] for j in range(height)]
	next_map=blank_map

def next_status(h,w):
	near_by_block=0
	for i in detect_area:
		detectx=i[0]+h
		detecty=i[1]+w
		if detectx<width and detectx>=0 and detecty<height and detecty>=0 and current_map[detectx][detecty]==1:
			near_by_block+=1
	if born.count(near_by_block)>0 and current_map[h][w]==0:
		return 1
	elif survive.count(near_by_block)>0 and current_map[h][w]==1:
		return 1
	else:
		return 0

def main():
	global next_map,current_map,is_game_continue,history_map,run_time_count
	for h in range(height):	
		for w in range(width):
			next_map[h][w]=next_status(h,w)
	if testing:
		run_time_count+=1
		for m in range(len(history_map)):
			if compare_map(next_map,history_map[m]) or run_time_count>max_running_time:
				is_game_continue=False
	current_map=next_map
	history_map.append(next_map)
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

def board_print(board,method):
	if method=="text":
		print("--------------------------------------------------")
		board_display = [[' ' for i in range(width)] for j in range(height)]
		for h in range(height):
			for w in range(width):
				if board[h][w]==1:
					board_display[h][w]="o"
		for i in range(height):
			display_string = ''.join(board_display[i])
			print(display_string)   
	elif method=="picture":
		data = image.imread(blank)
		plot_data = data.copy()
		for h in range(height):
			for w in range(width):
				if current_map[h][w]==1:
					plot_data[w][h] = [cell_color[0],cell_color[1],cell_color[2],1.0]
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
while is_game_continue:
		board_print(current_map,print_method)
		main()
		pyplot.pause(0.1)
    	#pyplot.clf()
board_print(current_map,print_method)
print(run_time_count)
		