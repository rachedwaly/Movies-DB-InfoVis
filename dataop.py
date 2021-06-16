import csv

filename = '/Users/ys24/Movies-DB-InfoVis/data/movies.csv'

with open(filename) as f:
    reader = csv.reader(f)
    print(list(reader))
