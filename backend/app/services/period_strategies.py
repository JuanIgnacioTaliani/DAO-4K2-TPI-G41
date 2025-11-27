from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import alquileres as m_alquileres

class PeriodAggregationStrategy(ABC):
    @abstractmethod
    def aggregate(self, db: Session, desde: Optional[datetime], hasta: Optional[datetime]) -> List[dict]:
        pass

class MonthAggregationStrategy(PeriodAggregationStrategy):
    def aggregate(self, db: Session, desde: Optional[datetime], hasta: Optional[datetime]) -> List[dict]:
        date_col = m_alquileres.Alquiler.fecha_inicio
        year = func.extract('year', date_col).label('anio')
        month = func.extract('month', date_col).label('mes')
        q = db.query(year, month, func.count().label('cantidad')).group_by(year, month)
        if desde:
            q = q.filter(date_col >= desde)
        if hasta:
            q = q.filter(date_col <= hasta)
        rows = q.order_by(year.asc(), month.asc()).all()
        return [
            {"periodo": f"{int(r.anio)}-{int(r.mes):02d}", "cantidad_alquileres": int(r.cantidad)}
            for r in rows
        ]

class QuarterAggregationStrategy(PeriodAggregationStrategy):
    def aggregate(self, db: Session, desde: Optional[datetime], hasta: Optional[datetime]) -> List[dict]:
        date_col = m_alquileres.Alquiler.fecha_inicio
        year = func.extract('year', date_col).label('anio')
        quarter = func.ceil(func.extract('month', date_col) / 3).label('trimestre')
        q = db.query(year, quarter, func.count().label('cantidad')).group_by(year, quarter)
        if desde:
            q = q.filter(date_col >= desde)
        if hasta:
            q = q.filter(date_col <= hasta)
        rows = q.order_by(year.asc(), quarter.asc()).all()
        return [
            {"periodo": f"{int(r.anio)}-Q{int(r.trimestre)}", "cantidad_alquileres": int(r.cantidad)}
            for r in rows
        ]

def get_period_strategy(periodo: str) -> PeriodAggregationStrategy:
    if periodo == "trimestre":
        return QuarterAggregationStrategy()
    return MonthAggregationStrategy()
