"""create live_monitoring table

Revision ID: eaf9e7ea1f9c
Revises: None
Create Date: 2026-06-25 17:57:18.350656

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'eaf9e7ea1f9c'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table('live_monitoring',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('machine_id', sa.String(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('usage_kwh', sa.Float(), nullable=True),
    sa.Column('lagging_reactive', sa.Float(), nullable=True),
    sa.Column('leading_reactive', sa.Float(), nullable=True),
    sa.Column('lagging_pf', sa.Float(), nullable=True),
    sa.Column('leading_pf', sa.Float(), nullable=True),
    sa.Column('co2', sa.Float(), nullable=True),
    sa.Column('nsm', sa.Integer(), nullable=True),
    sa.Column('week_status', sa.String(), nullable=True),
    sa.Column('day_of_week', sa.String(), nullable=True),
    sa.Column('load_type', sa.String(), nullable=True),
    sa.Column('confidence', sa.Float(), nullable=True),
    sa.Column('risk_level', sa.String(), nullable=True),
    sa.Column('recommendation', sa.String(), nullable=True),
    sa.Column('alert_status', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_live_monitoring_id'), 'live_monitoring', ['id'], unique=False)
    op.create_index(op.f('ix_live_monitoring_machine_id'), 'live_monitoring', ['machine_id'], unique=False)


def downgrade() -> None:

    op.drop_index(op.f('ix_live_monitoring_machine_id'), table_name='live_monitoring')
    op.drop_index(op.f('ix_live_monitoring_id'), table_name='live_monitoring')
    op.drop_table('live_monitoring')
