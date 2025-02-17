import matplotlib as plt

width=50
hight=50
current_map=[]
fate_map=[]
count=0
print_method="text"
seeds=[[24,25],[25,24],[25,25],[25,26],[26,24]]
is_game_continue=True

def initialization (width,hight):
    global current_map,fate_map
    current_map=[[0 for i in range(width)] for j in range(hight)]
    fate_map=[[0 for i in range(width)] for j in range(hight)]

def is_alive():
    global fate_map,current_map,hight,width,Born,Survive
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
                fate_map[w][h]=1
            #Survive Value
            elif (near_by_block == 2 or near_by_block == 3) and current_map[w][h]==1:
                fate_map[w][h]=1
            else:
                fate_map[w][h]=0

    current_map=fate_map
    fate_map=[[0 for i in range(width)] for j in range(hight)]

def seed(seed_list):
    global current_map
    for i in seed_list:
        current_map[i[0]][i[1]]=1

def map_print(current_map):
    if print_method=="text":
        for i in current_map:
            print(i)

def check_end():
    global count
    for i in range(width):
        for j in range(hight):
            if current_map[i][j]==1:
                return True
                count+=1
    return False

initialization(width,hight)
seed(seeds)
run_time_count=0
while is_game_continue and run_time_count<1000:
    print("")
    map_print(current_map)
    is_alive()
    is_game_continue=check_end()
    run_time_count+=1
print("")
map_print(current_map)
print(run_time_count)
