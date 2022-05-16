"""Add server settings updates info

Revision ID: 79a9a54e8f9d
Revises: ff917e2ab02e
Create Date: 2022-05-05 18:39:19.027828

"""
import sqlalchemy as sa
from alembic import op
# revision identifiers, used by Alembic.
from sqlalchemy import engine_from_config
from sqlalchemy.engine import reflection

revision = '79a9a54e8f9d'
down_revision = 'ff917e2ab02e'
branch_labels = None
depends_on = None


def upgrade():
    if not _table_has_column('server_settings', 'has_updates_available'):
        op.add_column('server_settings',
                      sa.Column('has_updates_available', sa.Boolean)
                      )

        t_ua = sa.Table(
            'server_settings',
            sa.MetaData(),
            sa.Column('id', sa.Integer, primary_key=True),
            sa.Column('has_updates_available', sa.Boolean)
        )
        conn = op.get_bind()
        conn.execute(t_ua.update().values(
            has_updates_available=False
        ))

    if not _table_has_column('server_settings', 'enable_updates_check'):
        op.add_column('server_settings',
                      sa.Column('enable_updates_check', sa.Boolean)
                      )

        t_ua = sa.Table(
            'server_settings',
            sa.MetaData(),
            sa.Column('id', sa.Integer, primary_key=True),
            sa.Column('enable_updates_check', sa.Boolean)
        )
        conn = op.get_bind()
        conn.execute(t_ua.update().values(
            enable_updates_check=True
        ))

    pass


def downgrade():
    pass


def _table_has_column(table, column):
    config = op.get_context().config
    engine = engine_from_config(
        config.get_section(config.config_ini_section), prefix='sqlalchemy.')
    insp = reflection.Inspector.from_engine(engine)
    has_column = False

    for col in insp.get_columns(table):
        if column != col['name']:
            continue
        has_column = True
    return has_column