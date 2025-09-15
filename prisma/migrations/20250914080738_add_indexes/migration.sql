-- CreateIndex
CREATE INDEX `Review_storeId_date_idx` ON `Review`(`storeId`, `date`);

-- CreateIndex
CREATE INDEX `Service_storeId_isActive_idx` ON `Service`(`storeId`, `isActive`);

-- CreateIndex
CREATE INDEX `Store_userId_idx` ON `Store`(`userId`);
