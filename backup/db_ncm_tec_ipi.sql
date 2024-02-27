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
-- Table structure for table `tec_ipi`
--

DROP TABLE IF EXISTS `tec_ipi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tec_ipi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ncm_codigo` varchar(20) DEFAULT NULL,
  `ncm_sequencial` varchar(10) DEFAULT NULL,
  `unidade_medida_codigo` varchar(10) DEFAULT NULL,
  `unidade_medida_descricao` varchar(255) DEFAULT NULL,
  `ii` varchar(10) DEFAULT NULL,
  `ii_normal` varchar(10) DEFAULT NULL,
  `tipo_ii` varchar(10) DEFAULT NULL,
  `ipi` varchar(10) DEFAULT NULL,
  `ipi_normal` varchar(10) DEFAULT NULL,
  `tipo_ipi` varchar(10) DEFAULT NULL,
  `pis_pasep` varchar(10) DEFAULT NULL,
  `cofins` varchar(10) DEFAULT NULL,
  `tipo_icms` varchar(10) DEFAULT NULL,
  `gatt` varchar(10) DEFAULT NULL,
  `mercosul` varchar(10) DEFAULT NULL,
  `existe_st` char(1) DEFAULT NULL,
  `necessidade_li` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tec_ipi`
--

LOCK TABLES `tec_ipi` WRITE;
/*!40000 ALTER TABLE `tec_ipi` DISABLE KEYS */;
INSERT INTO `tec_ipi` VALUES (1,'73182100','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(2,'84831050','001','11','Unidade','0','0','%','7,8','7,8','%','3,12','14,37','TN','35','0','S','C'),(3,'84821090','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(4,'73129000','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(5,'73121090','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(6,'73079200','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(7,'73181500','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(8,'73071920','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(9,'73072900','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(10,'73079900','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(11,'84089090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(12,'73072200','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(13,'73182400','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(14,'84834090','001','11','Unidade','12,6','12,6','%','0','0','%','3,12','14,37','R','25','0','S','C'),(15,'84212300','001','11','Unidade','16','16','%','5,2','5,2','%','3,12','14,37','TN','25','0','S','C'),(16,'84131900','001','11','Unidade','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(17,'73269090','001','10','Kg Líquido','18','18','%','5','5','%','2,1','9,65','TN','35','0','S','C'),(18,'84212990','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(19,'73144100','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(20,'73170090','001','10','Kg Líquido','12,6','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(21,'84219999','001','10','Kg Líquido','12,6','12,6','%','5,2','5,2','%','2,1','9,65','TN','25','0','S','C'),(22,'84831090','001','11','Unidade','16','16','%','0','0','%','3,12','14,37','TN','35','0','S','C'),(23,'73143900','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(24,'84818099','001','11','Unidade','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(25,'84839000','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(26,'84849000','001','10','Kg Líquido','16','16','%','7,8','7,8','%','2,1','9,65','TN','35','0','S','C'),(27,'73202090','001','10','Kg Líquido','16','16','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(28,'73209000','001','10','Kg Líquido','16','16','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(29,'84834010','001','11','Unidade','12,6','12,6','%','0','0','%','3,12','14,37','R','25','0','S','C'),(30,'73182200','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(31,'84835090','001','11','Unidade','16','16','%','7,8','7,8','%','3,12','14,37','TN','35','0','S','C'),(32,'73079100','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(33,'84833090','001','11','Unidade','16','16','%','7,8','7,8','%','3,12','14,37','TN','25','0','S','C'),(34,'84139190','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(35,'73181600','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(36,'73182900','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(37,'84129080','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(38,'84833029','001','11','Unidade','16','16','%','7,8','7,8','%','3,12','14,37','TN','35','0','S','C'),(39,'84122110','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(40,'73202010','001','10','Kg Líquido','16','16','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(41,'73261900','001','10','Kg Líquido','18','18','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(42,'73181900','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(43,'73121010','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(44,'73029000','001','10','Kg Líquido','10,8','10,8','%','0','0','%','2,1','9,65','TN',NULL,'0',NULL,'C'),(45,'84836090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(46,'73182300','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(47,'84242000','001','11','Unidade','11,2','12,6','%','3,25','3,25','%','2,1','9,65','R','35','0',NULL,'C'),(48,'73071990','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(49,'84828000','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(50,'84812019','001','11','Unidade','0','0','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(51,'84814000','001','11','Unidade','0','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(52,'84818092','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(53,'84829190','001','10','Kg Líquido','12,6','12,6','%','7,8','7,8','%','2,1','9,65','TN','35','0','S','C'),(54,'84254910','001','11','Unidade','16','16','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(55,'84812090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(56,'84823000','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(57,'73181200','001','10','Kg Líquido','14,4','14,4','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(58,'84148090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(59,'84148019','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','35','0','S','C'),(60,'84145990','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','25','0','S','C'),(61,'84312011','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(62,'84314923','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(63,'84213100','001','11','Unidade','16','16','%','5,2','5,2','%','3,12','14,37','TN','35','0','S','C'),(64,'84099969','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(65,'84813000','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(66,'73151100','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(67,'73071100','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(68,'73259910','001','10','Kg Líquido','18','18','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(69,'73151290','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(70,'73151210','001','10','Kg Líquido','12,6','12,6','%','15','15','%','2,1','9,65','TN','35','0','S','C'),(71,'84133090','001','11','Unidade','18','18','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(72,'84129090','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(73,'84829910','001','10','Kg Líquido','0','0','%','7,8','7,8','%','2,1','9,65','TN','35','0','S','C'),(74,'84253110','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(75,'84879000','001','10','Kg Líquido','12,6','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0',NULL,'C'),(76,'84314929','001','10','Kg Líquido','0','0','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(77,'73151900','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0',NULL,'C'),(78,'84122900','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(79,'84138100','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(80,'84122190','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(81,'84136011','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(82,'84123900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(83,'84135090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(84,'84123110','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(85,'84136090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(86,'84135010','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(87,'84128000','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(88,'84099999','001','10','Kg Líquido','16','16','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(89,'84311090','001','10','Kg Líquido','11,2','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(90,'84313900','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(91,'84836019','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(92,'84133030','001','11','Unidade','18','18','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(93,'73144200','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(94,'84831019','001','11','Unidade','16','16','%','0','0','%','3,12','14,37','TN','35','0','S','C'),(95,'84825010','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(96,'84841000','001','10','Kg Líquido','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(97,'84099190','001','10','Kg Líquido','16','16','%','3,25','3,25','%','3,12','14,37','TN','35','0','S','C'),(98,'84145190','001','11','Unidade','18','18','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(99,'84195021','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0','S','C'),(100,'84159090','001','10','Kg Líquido','12,6','12,6','%','20','20','%','2,1','9,65','TN','25','0','S','C'),(101,'84819090','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(102,'84662010','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(103,'84824000','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(104,'73102990','001','10','Kg Líquido','12,6','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(105,'84842000','001','10','Kg Líquido','12,6','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(106,'84818019','001','11','Unidade','16,2','16,2','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(107,'84193900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(108,'84249090','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(109,'84149020','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(110,'84821010','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(111,'84829119','001','10','Kg Líquido','12,6','12,6','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(112,'84829120','001','10','Kg Líquido','12,6','12,6','%','7,8','7,8','%','2,1','9,65','TN','35','0','S','C'),(113,'84811000','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(114,'84822010','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(115,'84825090','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(116,'84251910','001','11','Unidade','14,4','14,4','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(117,'84831030','001','11','Unidade','16','16','%','0','0','%','3,12','14,37','TN','35','0','S','C'),(118,'84213200','001','11','Unidade','18','18','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(119,'84212100','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(120,'73158900','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0',NULL,'C'),(121,'84219910','001','10','Kg Líquido','12,6','12,6','%','5,2','5,2','%','2,1','9,65','TN','25','0','S','C'),(122,'84195090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','35','0','S','C'),(123,'73043990','001','10','Kg Líquido','14,4','14,4','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(124,'84829990','001','10','Kg Líquido','12,6','12,6','%','7,8','7,8','%','2,1','9,65','TN','35','0','S','C'),(125,'73089010','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(126,'73049090','001','10','Kg Líquido','16','16','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(127,'73041100','001','10','Kg Líquido','14,4','14,4','%','0','0','%','2,1','9,65','TN','20','0',NULL,'C'),(128,'84822090','001','11','Unidade','16','16','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(129,'84672100','001','11','Unidade','18','18','%','5,2','5,2','%','2,1','9,65','TN','35','0','S','C'),(130,'84158210','001','11','Unidade','18','18','%','13','13','%','2,1','9,65','TN','35','0','S','C'),(131,'84871000','001','11','Unidade','11,2','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0',NULL,'C'),(132,'84148011','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0','S','C'),(133,'84148012','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0','S','C'),(134,'73110000','001','10','Kg Líquido','12,6','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(135,'84812011','001','11','Unidade','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0','S','C'),(136,'84131100','001','11','Unidade','11,2','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(137,'84123190','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(138,'84818095','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','25','0','S','C'),(139,'84818029','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(140,'84798931','001','11','Unidade','16,2','16,2','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(141,'84799090','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(142,'84719090','001','11','Unidade','12,8','14,4','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(143,'84148039','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(144,'84132000','001','11','Unidade','18','18','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(145,'84329000','001','10','Kg Líquido','11,2','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(146,'73069020','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(147,'84196000','001','11','Unidade','0','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(148,'84042000','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(149,'84679900','001','10','Kg Líquido','11,2','12,6','%','5,2','5,2','%','2,1','9,65','TN','35','0','S','C'),(150,'84133020','001','11','Unidade','18','18','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(151,'73023000','001','10','Kg Líquido','10,8','10,8','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(152,'73072100','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(153,'84791090','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(154,'84615090','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(155,'84619090','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(156,'84609090','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(157,'84602900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(158,'84669490','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(159,'84601900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(160,'84306100','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(161,'84733090','001','10','Kg Líquido','6,4','7,2','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(162,'84672992','001','11','Unidade','18','18','%','5,2','5,2','%','2,1','9,65','R','35','0','S','C'),(163,'84669360','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(164,'84592900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(165,'73089090','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(166,'84798999','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(167,'84254990','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(168,'84254200','001','11','Unidade','18','18','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(169,'73043910','001','10','Kg Líquido','16','16','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(170,'73259990','001','10','Kg Líquido','18','18','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(171,'84595900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(172,'84672999','001','11','Unidade','18','18','%','5,2','5,2','%','2,1','9,65','R','35','0','S','C'),(173,'84669350','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(174,'84669319','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(175,'84622900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(176,'84625900','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(177,'84669340','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(178,'84079000','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(179,'84212919','001','11','Unidade','0','0','%','0','0','%','2,1','9,65','TN','35','0',NULL,'S'),(180,'84099118','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','35','0','S','C'),(181,'84099115','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','35','0','S','C'),(182,'84099114','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','35','0','S','C'),(183,'84679100','001','10','Kg Líquido','11,2','12,6','%','5,2','5,2','%','2,1','9,65','TN','35','0','S','C'),(184,'73158200','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(185,'84099112','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','35','0','S','C'),(186,'84099120','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(187,'84099116','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(188,'73102910','001','10','Kg Líquido','12,6','12,6','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(189,'84661000','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(190,'84663000','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(191,'84678900','001','11','Unidade','11,2','12,6','%','5,2','5,2','%','2,1','9,65','TN','35','0','S','C'),(192,'84289090','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(193,'73024000','001','10','Kg Líquido','10,8','10,8','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(194,'73251000','001','10','Kg Líquido','18','18','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(195,'84073110','001','11','Unidade','16,2','16,2','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(196,'84559000','001','10','Kg Líquido','11,2','12,6','%','3,25','3,25','%','2,1','9,65','R','25','0',NULL,'C'),(197,'84714900','001','11','Unidade','12,8','14,4','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(198,'84689090','001','10','Kg Líquido','11,2','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(199,'84439933','001','10','Kg Líquido','0','0','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(200,'84718000','001','11','Unidade','12,8','14,4','%','9,75','9,75','%','2,1','9,65','TN','35','0',NULL,'C'),(201,'84733041','001','11','Unidade','9,6','10,8','%','15','15','%','2,1','9,65','TN','35','0','S','C'),(202,'84312090','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(203,'84689010','001','10','Kg Líquido','14,4','14,4','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(204,'73063000','001','10','Kg Líquido','14','14','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(205,'84224090','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(206,'84229090','001','10','Kg Líquido','11,2','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0',NULL,'C'),(207,'84716053','001','11','Unidade','9,6','10,8','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(208,'84151011','001','11','Unidade','16,2','16,2','%','20','20','%','2,1','9,65','TN','35','0','S','C'),(209,'84509090','001','10','Kg Líquido','14,4','14,4','%','13','13','%','2,1','9,65','TN','35','0','S','C'),(210,'84662090','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(211,'84314910','001','10','Kg Líquido','11,2','12,6','%','3,25','3,25','%','2,1','9,65','TN','25','0',NULL,'C'),(212,'84238200','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(213,'73239400','001','10','Kg Líquido','16,2','16,2','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(214,'73066100','001','10','Kg Líquido','14','14','%','5','5','%','2,1','9,65','TN','35','0',NULL,'C'),(215,'84798940','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(216,'84186931','001','11','Unidade','16,2','16,2','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','S'),(217,'84381000','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(218,'84679200','001','10','Kg Líquido','11,2','12,6','%','5,2','5,2','%','2,1','9,65','TN','35','0','S','C'),(219,'84563090','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(220,'84149039','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','25','0','S','C'),(221,'84137080','001','11','Unidade','11,2','12,6','%','3,25','3,25','%','2,1','9,65','R','35','0',NULL,'C'),(222,'84139110','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(223,'84142000','001','11','Unidade','16,2','16,2','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(224,'84137010','001','11','Unidade','0','12,6','%','3,25','3,25','%','2,1','9,65','R','35','0','S','C'),(225,'73231000','001','10','Kg Líquido','16,2','16,2','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(226,'84248910','001','11','Unidade','14,4','14,4','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(227,'84244100','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(228,'84669330','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(229,'84733032','001','10','Kg Líquido','0','0','%','1,3','1,3','%','2,1','9,65','TN','35','0','S','C'),(230,'73181400','001','10','Kg Líquido','16','16','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(231,'84733019','001','11','Unidade','8','9','%','6,5','6,5','%','2,1','9,65','TN','35','0','S','C'),(232,'84082090','001','11','Unidade','18','18','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(233,'73090090','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(234,'73083000','001','10','Kg Líquido','12,6','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(235,'84719019','001','11','Unidade','9,6','10,8','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(236,'84701000','001','11','Unidade','18','18','%','9,75','9,75','%','2,1','9,65','TN','35','0',NULL,'C'),(237,'84261200','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(238,'84669320','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','R','25','0',NULL,'C'),(239,'84439923','001','10','Kg Líquido','0','0','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(240,'84213990','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','35','0','S','C'),(241,'84713019','001','11','Unidade','12,8','14,4','%','15','15','%','2,1','9,65','TN','35','0','S','C'),(242,'84158290','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0','S','C'),(243,'73145000','001','10','Kg Líquido','12,6','12,6','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(244,'84818093','001','11','Unidade','12,6','12,6','%','0','0','%','2,1','9,65','R','25','0','S','C'),(245,'84151019','001','11','Unidade','18','18','%','20','20','%','2,1','9,65','TN','35','0','S','C'),(246,'84148031','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(247,'73130000','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(248,'84715010','001','11','Unidade','12,8','16','%','15','15','%','2,1','9,65','TN','35','0','S','C'),(249,'84339010','001','10','Kg Líquido','14,4','14,4','%','3,25','3,25','%','2,1','9,65','TN','35','0',NULL,'C'),(250,'84439939','001','10','Kg Líquido','6,4','7,2','%','6,5','6,5','%','2,1','9,65','TN',NULL,'0','S','C'),(251,'73064000','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','20','0',NULL,'C'),(252,'84331100','001','11','Unidade','16,2','16,2','%','3,25','3,25','%','2,1','9,65','R','35','0',NULL,'C'),(253,'84099915','001','11','Unidade','16','16','%','3,25','3,25','%','3,12','14,37','TN','25','0','S','C'),(254,'84714100','001','11','Unidade','16','16','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(255,'84715090','001','11','Unidade','12,8','14,4','%','15','15','%','2,1','9,65','TN','35','0',NULL,'C'),(256,'84835010','001','11','Unidade','16','16','%','7,8','7,8','%','3,12','14,37','TN','35','0','S','C'),(257,'84549090','001','10','Kg Líquido','11,2','12,6','%','0','0','%','2,1','9,65','TN','35','0',NULL,'C'),(258,'73079300','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C'),(259,'84741000','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(260,'84713012','001','11','Unidade','12,8','14,4','%','15','15','%','2,1','9,65','TN','35','0','S','C'),(261,'84716052','001','11','Unidade','9,6','10,8','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','C'),(262,'84671900','001','11','Unidade','10','10','%','3,25','3,25','%','2,1','9,65','R','10','0','S','C'),(263,'84145120','001','11','Unidade','18','18','%','9,75','9,75','%','2,1','9,65','TN','35','0','S','S'),(264,'84622300','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','R','35','0',NULL,'C'),(265,'84798912','001','11','Unidade','11,2','12,6','%','0','0','%','2,1','9,65','TN','25','0',NULL,'C'),(266,'84819010','001','10','Kg Líquido','14,4','14,4','%','7,8','7,8','%','2,1','9,65','TN','25','0','S','C'),(267,'73101090','001','10','Kg Líquido','12,6','12,6','%','3,25','3,25','%','2,1','9,65','TN','35','0','S','C');
/*!40000 ALTER TABLE `tec_ipi` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-22 18:40:16