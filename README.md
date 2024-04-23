# Running the project
This project was created on MacOS and the guide below is therefore for MacOS only. Additional steps may be required for other operating systems.

## 1. Clone the repository
``` bash
git clone https://github.com/qu-b/solar
cd solar
```
## 2. Environment Setup
Create a Conda environment and install the required packages.
``` bash
conda create -n solar python=3.11
conda activate solar
pip install -r requirements.txt
```
## 3. Environment variables
Set up the necessary environment variables. Replace `your_google_maps_api_key` with your actual API key.
``` bash
export GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 4. Database Setup

The data can be downloaded here: https://opendata.swiss/de/dataset/eignung-von-hausdachern-fur-die-nutzung-von-sonnenenergie/resource/2446ce7b-8709-42a1-b293-49b48129a5b4

### 4.1 Install PostgreSQL and gdal
```bash
brew install postgresql
brew install gdal
```

### 4.2 Start PostgreSQL Service
```bash
brew services start postgresql
```

### 4.3 Create a database
```bash
createdb solardb
```
### 4.4 Download PostGIS
```bash
brew install postgis
```

### 4.5 Enable PostGIS Extension
```bash
psql -d solardb -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 4.6 Import the Data
Download the data from the provided link and import it into the PostGIS database.

```bash
ogr2ogr -f "PostgreSQL" PG:"dbname=solardb host=localhost" "/path/to/your/SOLKAT_DACH.gpkg"
```

### 4.7 Create a role to connect to PostgreSQL
```bash
psql -d solardb -c "CREATE USER solar WITH PASSWORD 'solar';"
psql -d solardb -c "GRANT ALL PRIVILEGES ON DATABASE solardb TO solar;"
psql -d solardb -c "GRANT SELECT ON TABLE solkat_ch_dach TO solar;"
```

## 5. Run the application
``` bash
python app.py
```

![Screenshot of the app](/solar-app.png)

# Contributing
We welcome contributions and suggestions to improve this project. If you have any ideas or issues, please feel free to open an issue or create a pull request. For major changes, please open an issue first to discuss what you would like to change.


# License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
