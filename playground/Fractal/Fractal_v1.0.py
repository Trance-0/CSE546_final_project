from PIL import Image 
import math
import sys

# boundary settings
# lower=(-0.1,-0.07)
# upper=(0.1,0.07)
# resolution=0.0002
# c=(-0.55,-0.55)

lower=(-0.015,-0.01)
upper=(0.015,0.01)
resolution=0.00002

# image settings
borad_color=tuple([255,255,255])
cell_color=tuple([0,0,0])

# function setup
c=(-0.55,-0.55)

def i_multiply(j,k):
	j_r,j_i=j
	k_r,k_i=k
	return (j_r*k_r-j_i*k_i,j_i*k_r+k_i*j_r)
	
def zeta(x):
	# return x^2+c
	m_r,m_i=i_multiply(x,x)
	c_r,c_i=c
	return (m_r+c_r,m_i+c_i)

# basic variables
lo_r,lo_i = lower
hi_r,hi_i = upper
width=hi_r-lo_r
height=hi_i-lo_i
print_method="picture"
max_running_time=255
testing=True
board=[]

# bounding parameters
lob_r=-10000.0
lob_i=-10000.0
hib_r=10000.0
hib_i=10000.0

def is_in_bound(x):
	x_r,x_i=x
	return lob_r<=x_r<hib_r and lob_i<=x_i<hib_i	

# test if x is absbounded
def abs_bound(x,runtime):
	r,i=x
	return runtime<math.sqrt(r**2+i**2)

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
		image = Image.new("RGB",(len(board),len(board[0])),borad_color) 
		pim = image.load()
		for w in range(len(board)):
			for h in range(len(board[w])):
				pim[w,h]=(board[w][h],board[w][h],board[w][h])
				# if board[w][h]==max_running_time:
					# pim[w,h]= cell_colortyp
# use pyplot to plot the image
	image.show()

if testing:
	row_size=math.floor((hi_i-lo_i)*math.floor(1.0/resolution))
	total=row_size*math.floor((hi_r-lo_r)*math.floor(1.0/resolution))
	for r in range(math.floor((hi_r-lo_r)*math.floor(1.0/resolution))):
		board.append([])
		for i in range(math.floor((hi_i-lo_i)*math.floor(1.0/resolution))):
			# simulation start
			cur=(lo_r+r*resolution,lo_i+i*resolution)
			run_time_count=0
			while is_in_bound(cur) and run_time_count<max_running_time:
				cell_count=0
				run_time_count+=1
				cur=zeta(cur)
			board[r].append(run_time_count)
			sys.stderr.write('\r {:.2f}%'.format(float(r*row_size+i)/total*100))
			sys.stdout.flush()
			# if (run_time_count==max_running_time): print(f'cur:({lo_r+r*resolution})+i({lo_i+i*resolution}) {run_time_count}')
	board_print(board,print_method)
	print(f'low:({lo_r})+i({lo_i}),hi:({hi_r})+i({hi_i})')