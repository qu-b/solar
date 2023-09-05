from osgeo import ogr
import psycopg2

# Connect to the PostGIS database
connection = psycopg2.connect(
    dbname="solardb", user="Francis", password="Hkylife6!", host="localhost"
)

# Open the GPKG data source
gpkg_file = "/path/to/your/gpkg/file.gpkg"
gpkg_ds = ogr.Open(gpkg_file)

# Iterate through layers in the GPKG and import each layer into PostGIS
for i in range(gpkg_ds.GetLayerCount()):
    layer = gpkg_ds.GetLayerByIndex(i)
    layer_name = layer.GetName()

    # Use psycopg2 to copy data from the GPKG layer to PostGIS
    with connection.cursor() as cursor:
        cursor.execute(
            f"CREATE TABLE {layer_name} AS SELECT * FROM pg_read_from('/vsigzip/{gpkg_file}/{layer_name}')")
        connection.commit()

connection.close()
