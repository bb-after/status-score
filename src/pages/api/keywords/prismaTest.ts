import prisma from '../../../lib/prisma'; 

async function testDataSource() {
console.log('wtf');
    const dataSource = await prisma.dataSource.findMany();
  console.log(dataSource);
}

testDataSource();