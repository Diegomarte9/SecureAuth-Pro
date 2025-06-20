# Script para backup manual de la base de datos PostgreSQL en Docker
DB_CONTAINER=secureauth-pro-db-1
DB_NAME=secureauth
DB_USER=postgres
BACKUP_DIR=./db_backups

mkdir -p $BACKUP_DIR

docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql

echo "Backup guardado en $BACKUP_DIR" 