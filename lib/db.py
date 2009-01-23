from sqlalchemy import create_engine
db = create_engine('sqlite:///tmp/teste.db', echo=True)

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()

class Podcast(Base):
    __tablename__ = 'podcasts'

    id      = Column(Integer, primary_key=True)
    name    = Column(String)
    feed    = Column(String)
    url     = Column(String)
    img     = Column(String)

    def __init__(self, feed):
        self.feed = feed

    #def __repr__(self):
    #    return "<User('%s','%s','%s')>" % (self.name, self.fullname, self.password)

metadata = Base.metadata
metadata.create_all(db)

from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=db)
