#work on iPad only!!!!!!

from PIL import Image 
import random

#basic variables
width=50
hight=50
history_map=[]
current_map=[]
next_map=[]
blank_map=[]
count=0
print_method="picture"
is_game_continue=True
borad_color=tuple([255,255,255])
cell_color=tuple([0,0,0])
testing=False
max_running_time=1024

def rectangle_seeds(startx,starty,endx,endy):
		new_seeds=[]
		for i in range(startx,starty):
				for j in range(endx,endy):
						new_seeds.append([i,j])
		return new_seeds

def random_seeds(ratio):
		new_seeds=[]
		for i in range(width):
				for j in range(hight):
						poisbility=random.random()
						if poisbility<ratio:
								new_seeds.append([i,j])
		return new_seeds

def initialization (width,hight):
    global current_map,next_map,blank_map
    current_map=[[0 for i in range(width)] for j in range(hight)]
    blank_map=[[0 for i in range(width)] for j in range(hight)]
    next_map=blank_map

def is_alive():
    global next_map,current_map,is_game_continue,history_map
    for w in range(width):
        for h in range(hight):
            near_by_block=0
            detect_area=[[w+1,h+1],[w+1,h],[w+1,h-1],[w,h+1],[w,h-1],[w-1,h+1],[w-1,h],[w-1,h-1]]
            for i in detect_area:
                if i[0]<width and i[0]>=0 and i[1]<hight and i[1]>=0:
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
    next_map=[[0 for i in range(width)] for j in range(hight)]

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
				board_display = [[' ' for i in range(width)] for j in range(hight)]
				for w in range(width):
						for h in range(hight):
								if board[w][h]==1:
										board_display[w][h]="o"
				for i in range(width):
						display_string = ''.join(board_display[i])
						print(display_string)   
		elif method=="picture":
				image = Image.new("RGB",(width,hight),borad_color) 
				pim = image.load()
				for w in range(width):
						for h in range(hight):
								if board[h][w]==1:
										pim[w,h]= cell_color
# use pyplot to plot the image
				image.show()

#seeds
seeds0= random_seeds(0.5)
seeds1=[[24,25],[25,24],[25,25],[25,26],[26,24]]
seeds2=[[3,2],[3,3],[3,4]]
seeds3=[[24,24],[24,25],[24,26],[25,25],[26,24]]
seeds4=[[24,23],[24,24],[24,25],[25,23],[25,26],[26,24],[26,25]]
seeds5=rectangle_seeds(25,50,75,51)
seeds=seeds0

initialization(width,hight)
seed(seeds)
run_time_count=0
if testing:
		while is_game_continue and run_time_count<max_running_time:
				board_print(current_map,print_method)
				is_alive()
				run_time_count+=1
		board_print(current_map,print_method)
		print(run_time_count)
else:
		while is_game_continue:
				board_print(current_map,print_method)
				is_alive()
				run_time_count+=1
		board_print(current_map,print_method)
		print(run_time_count)