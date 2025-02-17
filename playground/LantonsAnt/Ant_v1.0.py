from matplotlib import image
from matplotlib import pyplot as plt
import numpy
import os
import random

#basic variables
width=100
height=100
history_map=[]
ant_map=[]
blank_map=[]
count=0
is_game_continue=True
world_rule=["1","3"]
#turn right=(ant_dir+1)%4
world_color=[[0,0,0],[255,255,255]]
#rule created,0=world_color[0],1=world_color[1]
ant_color=[255,0,0]
ant_dir=0
#0=north,1=west,2=south,3=east
ant_pos=[width//2,height//2]
#put the ant in center
testing=True
max_running_time=1024
printing_method="picture"
path = os.path.dirname(os.path.abspath(__file__))
blank= path + '/' + 'Blank_'+str(width)+'x'+str(height)+'.png'

def rectangle_seeds(startx,starty,endx,endy,color):
    global ant_map
    for i in range(startx,starty):
        for j in range(endx,endy):
            ant_map[i][j]=color
            

def random_seeds(ratio):
    global ant_map
    for i in range(width):
        for j in range(height):
            poisbility=random.random()
            if poisbility<ratio:
                ant_map[i][j]=random.radomInt
    return new_seeds

def initialization (width,height):
    global current_map,next_map,blank_map
    current_map=[[0 for i in range(width)] for j in range(height)]
    blank_map=[[0 for i in range(width)] for j in range(height)]

    next_map=blank_map

def update():
    global next_map,current_map,is_game_continue,history_map
    if printing_method=="picture":
        data = image.imread(blank)
        plot_data = data.copy()
    else:
        fig = plt.figure()
        ax = fig.add_subplot(111)
        ax.set_xlim(0, width)                  
        ax.set_ylim(0, height)  
        
    xdata=[]
    ydata=[]
    neigbordata=[]
    alive_count=0

    for w in range(width):
        for h in range(height):
            near_by_block=0
            detect_area=[[w+1,h+1],[w+1,h],[w+1,h-1],[w,h+1],[w,h-1],[w-1,h+1],[w-1,h],[w-1,h-1]]
            for i in detect_area:
                if i[0]<width and i[0]>=0 and i[1]<height and i[1]>=0:
                    if current_map[i[1]][i[0]]==1:
                        near_by_block+=1
            
            # Born Value
            if born.count(near_by_block)>0 and current_map[h][w]==0:
                next_map[h][w]=1
                xdata.append(h)
                ydata.append(w)

                alive_count+=1
            #Survive Value
            elif survive.count(near_by_block)>0 and current_map[h][w]==1:
                next_map[h][w]=1
                xdata.append(h)
                ydata.append(w)

                alive_count+=1
            else:
                next_map[h][w]=0

            if printing_method=="picture":
                if next_map[h][w]==1:
                    plot_data[w][h] = [cell_color[0],cell_color[1],cell_color[2],1.0]

            neigbordata.append(near_by_block)

    if printing_method=="text":
        for a in range(height):
            for b in range(width):
                label = str(neigbordata[a*width+b])
                plt.text(a,b,label)

    if printing_method=="point":
        ax.scatter(xdata,ydata,marker='s', color = 'blue')

    if printing_method=="picture":
        plt.imshow(plot_data)
        plt.pause(0.001)
        plt.clf()

    if testing:
        for m in range(len(history_map)):
            if compare_map(next_map,history_map[m]):
                is_game_continue=False
    
    current_map=next_map
    history_map.append(next_map.copy())
    next_map=[[0 for i in range(width)] for j in range(height)]
    print(alive_count)
    plt.show()

def compare_map(a,b):
    for i in range(len(a)):
        for j in range(len(a[i])):
            if a[i][j]!=b[i][j]:
                return False
    return True

initialization(width,height)
seed(seeds)
run_time_count=0
while is_game_continue and run_time_count<max_running_time:
    update()
    run_time_count+=1
print(run_time_count)