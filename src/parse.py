import geopandas as gpd

# Specify the path to your GeoPackage file
gpkg_file = "/Users/Francis/Documents/Dev/Apps/solaire/data/opendata/SOLKAT_DACH.gpkg"

# Specify the layer name
layer_name = 'SOLKAT_CH_DACH'

# Read the specified layer into a GeoDataFrame
gdf = gpd.read_file(gpkg_file, layer=layer_name)

# Display the GeoDataFrame
print(gdf.head())
