import random
from typing import Callable, List, Literal, Tuple
import itertools
import time
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from matplotlib.transforms import Affine2D
import mpl_toolkits.axisartist.floating_axes as floating_axes
n = 11

sample_method='All'

def sample_all(n:int)->List[List[int]]:
    '''
    Generate all permutations of the numbers 1 to n

    Args:   
        n (int): The number of elements in the permutation

    Returns:
        List[List[int]]: A list of all permutations of the numbers 1 to n, expected size n!
    '''
    return list(itertools.permutations(range(n)))

def cycle_representation(perm:List[int])->List[List[int]]:
    '''
    Generate the cycle representation of a permutation

    Args:
        perm (List[int]): The permutation to represent

    Returns:
        List[List[int]]: A list of cycles in the permutation
    '''
    cycles=[]
    visited=[False]*len(perm)
    def dfs(i:int,current_cycle:List[int]):
        if visited[i]:
            cycles.append(current_cycle)
            return
        visited[i]=True
        current_cycle.append(i)
        dfs(perm[i],current_cycle)
    for i in range(len(perm)):
        if not visited[i]:
            dfs(i,[])
    return cycles

def cycle_to_string(cycle:List[int])->str:
    '''
    Convert a cycle to a string
    '''
    s=''.join(['('+','.join(str(i) for i in c)+')' for c in cycle if len(c)>1])
    if len(s)==0: return 'e'
    return s

def selection_generator(n:int)->Tuple[int]:
    '''
    Generate a permutation of n elements with random selection from bag of n elements
    '''
    bag=list(range(n))
    perm=[]
    for _ in range(n):
        perm.append(bag.pop(random.randint(0,len(bag)-1)))
    return tuple(perm)

def get_sample_permutations(n:int,count:int,sample_method:Literal['All','Pseudo'],pseudo_method:Callable[[int],List[int]])->List[List[int]]:
    '''
    Get a sample of permutations
    Args:
        n (int): The number of elements in the permutation
        count (int): The number of permutations to sample
        sample_method (str): The method to sample the permutations, either 
            'All': Assigning equal probability to all possible permutations, select from all n! permutations
            'Pseudo': Use selected algorithm to generate permutations with "equal" probability

    Returns:
        List[List[int]]: A list of permutations
    '''
    if sample_method=='All':
        if n>11:
            raise ValueError('n is too large for All sampling, will take too long')
        return random.choices(sample_all(n),k=count)
    elif sample_method=='Pseudo':
        return [pseudo_method(n) for _ in range(count)]
    
def get_yong_diagram(cycle_representation:List[int])->List[int]:
    '''
    Get the Yong diagram of a permutation
    '''
    return sorted([len(cycle) for cycle in cycle_representation],reverse=True)
    
def plot_yong_diagram(cycle_representation:List[int])->None:
    '''
    Plot the Yong diagram of a permutation
    '''
    # get the length of the cycle
    psize=0
    cycle_lengths=[]
    for cycle in cycle_representation:
        cycle_lengths.append(len(cycle))
        psize+=len(cycle)
    cycle_lengths.sort(reverse=True)
    print(cycle_lengths)
    graph_size=max(max(cycle_lengths),len(cycle_lengths))
    # plot the histogram of the cycle lengths
    fig=plt.figure(figsize=(graph_size,graph_size))
    rects=[]
    for i,length in enumerate(cycle_lengths):
        for j in range(length):
            rect=Rectangle((j,i),1,1,facecolor='gray',edgecolor='black',linewidth=1)
            rects.append(rect)
            plt.gca().add_patch(rect)
    ax=plt.gca()
    ax.set_aspect('equal')
    ax.set_xlim(0,graph_size)
    ax.set_ylim(0,graph_size)
    plt.title(f'Yong Diagram of the permutation {cycle_representation if psize<10 else "size:"+str(psize)}')
    plt.grid(False)

    # rotate the plot 45 degrees?
    # plot_extents = 0, 10, 0, 10
    # transform = Affine2D().rotate_deg(45)
    # helper = floating_axes.GridHelperCurveLinear(transform, plot_extents)
    # ax = floating_axes.FloatingSubplot(fig, 111, grid_helper=helper)

    # fig.add_subplot(ax)

    # plt.xticks(rotation=-45)
    # plt.yticks(rotation=45)

    # plt.axis('off')
    plt.show()

def plot_max_cycle_length_distribution(cycle_representations:List[List[int]])->None:
    '''
    Plot the distribution of the maximum cycle length in the cycle representations
    '''
    max_cycle_lengths=[]
    for cycle_representation in cycle_representations:
        max_cycle_lengths.append(max(len(cycle) for cycle in cycle_representation))
    plt.hist(max_cycle_lengths,bins=range(1,max(max_cycle_lengths)+1),edgecolor='black')
    plt.show()

if __name__ == '__main__':
    # print(sample_all(n))
    # test get_sample_permutations and selection_generator
    time_start=time.time()
    pseudo_permutations=get_sample_permutations(n,10000,'Pseudo',selection_generator)
    time_end=time.time()
    print(f'Time taken: {time_end-time_start} seconds')
    # test get_sample_permutations and sample_all
    time_start=time.time()
    all_permutations=get_sample_permutations(n,10000,'All',sample_all)
    time_end=time.time()
    print(f'Time taken: {time_end-time_start} seconds')

    # plot the Yong diagram of the pseudo permutations
    # plot_yong_diagram(cycle_representation(pseudo_permutations[0]))

    # check the distribution of the two sampling methods
    print(cycle_representation(pseudo_permutations[0]))
    print(cycle_representation(all_permutations[0]))
    # plot max cycle length distribution for both sampling methods
    plot_max_cycle_length_distribution([cycle_representation(perm) for perm in pseudo_permutations])
    plot_max_cycle_length_distribution([cycle_representation(perm) for perm in all_permutations])

    # try to generate OEIS A000085
    for np in range(1,11):
        distinct_yong_diagrams=set()
        for perm in sample_all(np):
            distinct_yong_diagrams.add(str(get_yong_diagram(cycle_representation(perm))))
        print(np,len(distinct_yong_diagrams))
