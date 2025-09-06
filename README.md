#update git
1. git add .
2. git commit -m "detail" //save in my PC
3. git push //update in Github

#run first Project
npm i 
npm run dev
npx prisma migrate dev --name init
npm run db:seed

#MGoal:
    1.Auth(S)✅
    2.DataBase(Succes)✅
    #--- User ---#
    1.Homepage(Working)
    2.Storepage(Working)
    3.Paymentpage(Working)

    #--- Store ---#
    1.Storepage(N)
    2.Dashboardpage(N)
    3.Managepage(N)
    4.Task(N)

    #--- Admin ---#
    1.Dashboardpage(N)
    2.Managepage(N)
    3.Verifypage(N)