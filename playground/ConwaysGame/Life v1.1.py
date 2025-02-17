import matplotlib as plt

width=50
hight=50
history_map=[]
current_map=[]
next_map=[]
blank_map=[]
count=0
print_method="text"
seeds1=[[24,25],[25,24],[25,25],[25,26],[26,24]]
seeds2=[[3,2],[3,3],[3,4]]
seeds=seeds1
is_game_continue=True

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
                    if current_map[i[0]][i[1]]==1:
                        near_by_block+=1
            
            # Born Value
            if (near_by_block == 3) and current_map[w][h]==0:
                next_map[w][h]=1
            #Survive Value
            elif (near_by_block == 2 or near_by_block == 3) and current_map[w][h]==1:
                next_map[w][h]=1
            else:
                next_map[w][h]=0
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
        current_map[i[0]][i[1]]=1

def board_print(broad):
    board_display = [['   ' for i in range(width)] for j in range(hight)]
    for w in range(width):
        for h in range(hight):
            if broad[w][h]==1:
                board_display[w][h]="o"
    for i in range(width):
        display_string = ''.join(board_display[i])
        print(display_string)   

initialization(width,hight)
seed(seeds)
run_time_count=0
while is_game_continue and run_time_count<1000:
    print("-------------------------------------------------")
    board_print(current_map)
    is_alive()
    run_time_count+=1
print("-------------------------------------------------")
board_print(current_map)
print(run_time_count)
