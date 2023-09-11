from sqlalchemy import Column, Integer, Float, String, SmallInteger, BigInteger, DateTime
from geoalchemy2 import Geometry
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class SolkatChDach(Base):
    __tablename__ = 'solkat_ch_dach'

    objectid = Column(Integer, primary_key=True)
    df_uid = Column(BigInteger)
    df_nummer = Column(SmallInteger)
    datum_erstellung = Column(DateTime(timezone=True))
    datum_aenderung = Column(DateTime(timezone=True))
    sb_uuid = Column(String)
    sb_objektart = Column(SmallInteger)
    sb_datum_erstellung = Column(DateTime(timezone=True))
    sb_datum_aenderung = Column(DateTime(timezone=True))
    klasse = Column(SmallInteger)
    flaeche = Column(Float)
    ausrichtung = Column(SmallInteger)
    neigung = Column(SmallInteger)
    mstrahlung = Column(SmallInteger)
    gstrahlung = Column(Integer)
    stromertrag = Column(Integer)
    stromertrag_sommerhalbjahr = Column(Integer)
    stromertrag_winterhalbjahr = Column(Integer)
    waermeertrag = Column(Integer)
    duschgaenge = Column(SmallInteger)
    dg_heizung = Column(SmallInteger)
    dg_waermebedarf = Column(SmallInteger)
    bedarf_warmwasser = Column(Integer)
    bedarf_heizung = Column(Integer)
    flaeche_kollektoren = Column(Float)
    volumen_speicher = Column(Integer)
    gwr_egid = Column(Integer)
    geom = Column(Geometry(geometry_type='MULTIPOLYGON', srid=2056))

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns if c.name != 'geom'}
