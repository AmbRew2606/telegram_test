#Как развернуть проект?
1. GOLAND и POSTGRE install
2. как всё поставишь, клонируешь дев ветку, и через PowerSHell установи бекап на таблицу
    ```bash
    pg_restore -U postgres -d db_telegramtests -c psql_backup\db.backup
    ```
3. Создать в корне проекта .env файл (если его МОК мы еще не залили в репу)
    Его ожидаемое содержимое:
    ````postgresql
        PORT=8081
        DATABASE_URL=postgres://postgres:YOURPOSTGRPWD@localhost:5432/db_telegramtests?sslmode=disable
        TELEGRAM_BOT_TOKEN=XXXXXXXXXX:somehash 
    ````
4. после этого запусти две консоли - одна в корне проекта, другая в каталоге фронта 
    1) в беке запусти 
    ```bash
        go run cmd/server.go
    ```
    2) на фронте ```npm install```, а потом ```npm run dev```
5. ???
6. PROFIT!