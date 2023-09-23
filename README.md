# Interesting Links

How parametric insurance can accelerate solar investment
[https://www.swissre.com/risk-knowledge/mitigating-climate-risk/parametric-insurance-accelerate-solar-investment.html]

## PostgreSQL

`pg_ctl -D /usr/local/var/postgres start`
`pg_ctl -D /usr/local/var/postgres status`
`pg_ctl -D /usr/local/var/postgres stop`

### Example Query

`SELECT ST_AsGeoJSON(solkat_ch_dach.geom) AS geojson`
`FROM solkat_ch_dach`
`WHERE ST_DWithin(solkat_ch_dach.geom, ST_Transform(ST_SetSRID(ST_MakePoint(7.4440, 46.9465), 4326), 2056), 10);`

with final result:
{"type":"MultiPolygon","crs":{"type":"name","properties":{"name":"EPSG:2056"}},"coordinates":[[[[2600414.5225,1199479.098],[2600415.4047,1199471.4242],[260041
4.4925,1199478.9984],[2600414.149,1199481.851],[2600414.1027,1199482.3167],[2600414.0318,1199483.0302],[2600414.0699,1199483.0346],[2600414.1518,1199482.3224],
[2600414.5225,1199479.098]]]]}

## Conda Environment for Python

- conda install flask folium geopandas sqlalchemy psycopg2 geoalchemy2
- conda install -c conda-forge geoalchemy2 Flask-SQLAlchemy

# Data Schema Description

## Field Definitions

1. **OBJECTID** (Object ID): Unique identifier for each record.
2. **SHAPE** (Polygon): Geometry information for a polygon.
3. **SHAPE_Length** (Double): Length of the polygon shape.
4. **SHAPE_Area** (Double): Area of the polygon shape.
5. **DF_UID** (Roof Surface Identifier): Long Integer, continuous number used for identifying and linking records.
6. **DF_NUMMER** (Roof Surface Number): Short Integer, continuous number for each roof surface within a building.
7. **DATUM_ERSTELLUNG** (Creation Date): DateTime, date and time of the roof surface creation or calculation in SunRoof.ch.
8. **DATUM_AENDERUNG** (Modification Date): DateTime, date and time of the last modification, initially the same as creation date.
9. **SB_UUID** (swissBUILDINGS UUID): Guid, UUID of the building to which the roof surface belongs in the swissBUILDINGS3D 2.0 dataset.
10. **SB_OBJEKTART** (swissBUILDINGS Object Type): Short Integer, attribute describing the object type from the swissBUILDINGS3D 2.0 dataset.
11. **SB_DATUM_ERSTELLUNG** (swissBUILDINGS Creation Date): DateTime, date and time attribute from the swissBUILDINGS3D 2.0 dataset, required for updates from SunRoof.ch.
12. **SB_DATUM_AENDERUNG** (swissBUILDINGS Modification Date): DateTime, date and time attribute from the swissBUILDINGS3D 2.0 dataset, required for updates from SunRoof.ch.
13. **KLASSE** (Classification): Short Integer, classification of roof surfaces based on the EIGNUNG_DACH domain, determined by MSTRAHLUNG.
14. **FLAECHE** (Area [m2]): Double, usable area of the roof surface, equivalent to the physical roof area and the maximum module area.
15. **AUSRICHTUNG** (Orientation [°]): Short Integer, orientation of the roof surface in degrees from North (-180°) clockwise through East (-90°), South (0°), and West (90°) back to North (180°).
16. **NEIGUNG** (Inclination [°]): Short Integer, inclination angle of the roof surface in degrees, where 0° is horizontal.
17. **MSTRAHLUNG** (Average Irradiation [kWh/m2/year]): Short Integer, calculated average annual irradiation per square meter, considering shading.
18. **GSTRAHLUNG** (Total Irradiation [kWh/year]): Long Integer, calculated total annual irradiation considering shading.
19. **STROMERTRAG** (Electricity Yield [kWh/year]): Long Integer, calculated electricity yield, derived from GSTRAHLUNG with module efficiency and performance ratio.
20. **STROMERTRAG_SOMMERHALBJAHR** (Electricity Yield - Summer Half-Year [kWh/summer half-year]): Long Integer, calculated electricity yield for the summer half-year (April 1st to September 30th).
21. **STROMERTRAG_WINTERHALBJAHR** (Electricity Yield - Winter Half-Year [kWh/winter half-year]): Long Integer, calculated electricity yield for the winter half-year (October 1st to March 31st).
22. **WAERMEERTRAG** (Heat Yield [kWh/year]): Long Integer, calculated heat yield for a representative system configuration with appropriately sized solar thermal equipment.
23. **DUSCHGAENGE** (Number of Showers): Short Integer, calculated average number of showers per day based on the total heat yield.
24. **DG_HEIZUNG** (Solar Heating Coverage [%]): Short Integer, calculated solar heating coverage percentage for heating using the heating support portion from the heat yield.
25. **DG_WAERMEBEDARF** (Solar Heat Demand Coverage [%]): Short Integer, calculated solar heat demand coverage percentage for the total heat demand.
26. **BEDARF_WARMWASSER** (Hot Water Demand [kWh/year]): Long Integer, estimated hot water demand based on GWR data for building's domestic hot water.
27. **BEDARF_HEIZUNG** (Heating Demand [kWh/year]): Long Integer, estimated heating demand based on GWR data for building's heating.
28. **FLAECHE_KOLLEKTOREN** (Collector Area [m2]): Double, collector area used for calculations in the solar thermal system adapted to the demand.
29. **VOLUMEN_SPEICHER** (Storage Volume [l]): Long Integer, storage volume used in the solar thermal system adapted to the demand.
30. **GWR_EGID** (Building Identifier in GWR): Long Integer, Swiss Federal Building Identifier (EGID) for the record from the Building and Housing Register (GWR) associated with the building in swissBUILDINGS3D 2.0 dataset. If multiple GWR records are associated with the building, one is selected randomly.
