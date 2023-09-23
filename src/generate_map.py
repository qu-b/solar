from sqlalchemy import func
from geoalchemy2.functions import ST_DWithin, ST_SetSRID, ST_MakePoint
import folium
import json
from solardata import SolkatChDach
import polygon_handler
from shapely.geometry import shape, Point


def fetch_roof_data(db_session, latitude, longitude, distance_in_meters=100):
    transformed_point = func.ST_Transform(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),  # WGS 84
        2056  # Swiss coordinate system
    )

    query = (db_session.query(
        func.ST_AsGeoJSON(func.ST_Transform(SolkatChDach.geom, 4326)),
        SolkatChDach.mstrahlung,
        SolkatChDach.flaeche,
        SolkatChDach.ausrichtung,
        SolkatChDach.neigung,
        SolkatChDach.df_uid,
        SolkatChDach.sb_uuid
    )
        .filter(ST_DWithin(SolkatChDach.geom, transformed_point, distance_in_meters))
    )

    results = query.all()
    geojson_data = []
    user_point = Point(longitude, latitude)
    user_df_uid = None  # Initialize the user_df_uid variable
    user_sb_uuid = None

    for row in results:
        geom_geojson = json.loads(row[0])
        geom_shape = shape(geom_geojson)

        # Check if user_point is within this polygon and if so, assign its df_uid to user_df_uid
        if geom_shape.contains(user_point):
            # Assign df_uid of the polygon containing the user point
            user_df_uid = row[5]

        if geom_shape.contains(user_point):
            user_sb_uuid = row[6]

        geojson_data.append({
            "type": "Feature",
            "properties": {
                "mstrahlung": row[1],
                "flaeche": row[2],
                "ausrichtung": row[3],
                "neigung": row[4],
                "df_uid": row[5],
                "sb_uuid": row[6]
            },
            "geometry": geom_geojson
        })

    return {"type": "FeatureCollection", "features": geojson_data, "user_df_uid": user_df_uid,  "user_sb_uuid": user_sb_uuid}


def assign_colors(polygons):
    for polygon in polygons:
        mstrahlung = polygon['properties']['mstrahlung']
        color = ('lightblue' if mstrahlung < 800 else 'yellow' if mstrahlung < 1000
                 else 'orange' if mstrahlung < 1200 else 'darkorange' if mstrahlung < 1400 else 'red')
        polygon['properties']['color'] = color
    return polygons


def generate_folium_map(db_session, latitude, longitude):
    geojson_data = fetch_roof_data(db_session, latitude, longitude)
    user_df_uid = geojson_data.get('user_df_uid')
    polygons = assign_colors(geojson_data.get('features', []))

    map_instance = folium.Map(
        location=[latitude, longitude], zoom_start=19, max_zoom=24, control_scale=True)
    folium.raster_layers.WmsTileLayer(
        url="https://wms.geo.admin.ch/",
        layers="ch.swisstopo.swissimage",
        fmt="image/jpeg",
        overlay=False,
        control=True,
        max_zoom=24).add_to(map_instance)

    if user_df_uid:
        highest_yield_polygon = polygon_handler.get_highest_yield_polygon(
            polygons, user_df_uid)
        if highest_yield_polygon:
            centroid = shape(highest_yield_polygon['geometry']).centroid
            df_uid = highest_yield_polygon['properties']['df_uid']
            folium.Marker([centroid.y, centroid.x], popup=f'Highest Yield Polygon<br>df_uid: {df_uid}',
                          icon=folium.Icon(icon='cloud')).add_to(map_instance)

    geojson_layer = folium.GeoJson(
        geojson_data,
        name='geojson',
        style_function=lambda feature: {
            'fillColor': feature['properties']['color'],
            'color': 'black',
            'weight': 1,
            'opacity': 0.5,
            'fillOpacity': 0.7
        }
    )

    # geojson_layer.add_child(folium.GeoJsonTooltip(fields=['df_uid']))

    # Add the GeoJson layer to the map
    map_instance.add_child(geojson_layer)

    return map_instance
