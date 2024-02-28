-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: db_ncm
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tec_pisdeb`
--

DROP TABLE IF EXISTS `tec_pisdeb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tec_pisdeb` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dataInicio` date DEFAULT NULL,
  `idMercadoria` int DEFAULT NULL,
  `ncm` varchar(10) DEFAULT NULL,
  `mercadoria` varchar(255) DEFAULT NULL,
  `unidade` varchar(10) DEFAULT NULL,
  `naturezaOperacao` varchar(100) DEFAULT NULL,
  `mercadoRem` varchar(50) DEFAULT NULL,
  `regiaoRem` varchar(50) DEFAULT NULL,
  `regimeApuracaoRem` varchar(50) DEFAULT NULL,
  `regimeTributarioRem` varchar(50) DEFAULT NULL,
  `ramoAtividadeRem` varchar(50) DEFAULT NULL,
  `segmentoRem` varchar(50) DEFAULT NULL,
  `mercadoDest` varchar(50) DEFAULT NULL,
  `regiaoDest` varchar(50) DEFAULT NULL,
  `regimeApuracaoDest` varchar(50) DEFAULT NULL,
  `regimeTributarioDest` varchar(50) DEFAULT NULL,
  `ramoAtividadeDest` varchar(50) DEFAULT NULL,
  `segmentoDest` varchar(50) DEFAULT NULL,
  `pisDebito` decimal(10,2) DEFAULT NULL,
  `cofinsDebito` decimal(10,2) DEFAULT NULL,
  `cst` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tec_pisdeb`
--

LOCK TABLES `tec_pisdeb` WRITE;
/*!40000 ALTER TABLE `tec_pisdeb` DISABLE KEYS */;
/*!40000 ALTER TABLE `tec_pisdeb` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-28 16:01:52
