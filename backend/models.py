from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class TipeDataran(Base):
    __tablename__ = "tipedataran"
    
    id = Column(Integer, primary_key=True, index=True)
    tipe = Column(String, nullable=False)
    
    # Relationship
    destinasi = relationship("Destinasi", back_populates="tipe_dataran")

class JenisWaktu(Base):
    __tablename__ = "jeniswaktu"
    
    id = Column(Integer, primary_key=True, index=True)
    waktu = Column(String, nullable=False)
    
    # Relationship
    waktu_real = relationship("WaktuReal", back_populates="jenis_waktu")
    rekomendasi = relationship("Rekomendasi", back_populates="jenis_waktu")

class TipeAktivitas(Base):
    __tablename__ = "tipeaktivitas"
    
    id = Column(Integer, primary_key=True, index=True)
    tipe = Column(String, nullable=False)
    
    # Relationship
    destinasi = relationship("Destinasi", back_populates="tipe_aktivitas")

class Kabupaten(Base):
    __tablename__ = "kabupaten"
    
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, nullable=False)
    
    # Relationship
    destinasi = relationship("Destinasi", back_populates="kabupaten")

class Destinasi(Base):
    __tablename__ = "destinasi"
    
    kode = Column(String, primary_key=True, index=True)
    nama = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    tipedataran_id = Column(Integer, ForeignKey("tipedataran.id"))
    tipeaktivitas_id = Column(Integer, ForeignKey("tipeaktivitas.id"))
    kabupaten_id = Column(Integer, ForeignKey("kabupaten.id"))
    
    # Relationships
    tipe_dataran = relationship("TipeDataran", back_populates="destinasi")
    tipe_aktivitas = relationship("TipeAktivitas", back_populates="destinasi")
    kabupaten = relationship("Kabupaten", back_populates="destinasi")
    waktu_real = relationship("WaktuReal", back_populates="destinasi")
    rekomendasi = relationship("Rekomendasi", back_populates="destinasi")

class WaktuReal(Base):
    __tablename__ = "waktureal"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tanggal = Column(String)
    jam = Column(String)
    kondisi = Column(String)
    jeniswaktu_id = Column(Integer, ForeignKey("jeniswaktu.id"))
    destinasi_kode = Column(String, ForeignKey("destinasi.kode"))
    
    # Relationships
    jenis_waktu = relationship("JenisWaktu", back_populates="waktu_real")
    destinasi = relationship("Destinasi", back_populates="waktu_real")

class TempatWisata(Base):
    __tablename__ = "tempat_wisata"
    
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True)
    kabupaten = Column(String)
    tipe_dataran = Column(String)  # Pantai, Pegunungan, Hutan, dll
    tingkat_aktivitas = Column(String)  # Rendah, Sedang, Tinggi
    popularitas = Column(Float)  # 0-5 rating
    latitude = Column(Float)
    longitude = Column(Float)
    deskripsi = Column(Text)
    gambar_url = Column(String, nullable=True)

class Rekomendasi(Base):
    __tablename__ = "rekomendasi"
    
    id = Column(Integer, primary_key=True, index=True)
    waktu_request = Column(DateTime)
    preferensi = Column(Text)  # JSON string of preferences
    hasil = Column(Text)  # JSON string of results
