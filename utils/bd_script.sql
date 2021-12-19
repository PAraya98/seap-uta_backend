-- MySQL Script generated by MySQL Workbench
-- Fri Dec 17 22:19:17 2021
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema seap_uta
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema seap_uta
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `seap_uta` DEFAULT CHARACTER SET utf8 ;
USE `seap_uta` ;

-- -----------------------------------------------------
-- Table `seap_uta`.`lenguaje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seap_uta`.`lenguaje` (
  `id_lenguaje` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `image_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_lenguaje`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `seap_uta`.`repositorio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seap_uta`.`repositorio` (
  `id_repositorio` INT NOT NULL AUTO_INCREMENT,
  `id_convergence` VARCHAR(100) NOT NULL,
  `name` VARCHAR(20) NOT NULL,
  `visibility` TINYINT NOT NULL DEFAULT 0,
  `id_lenguaje` INT NOT NULL,
  PRIMARY KEY (`id_repositorio`),
  INDEX `fk_repositorio_lenguaje1_idx` (`id_lenguaje` ASC) VISIBLE,
  CONSTRAINT `fk_repositorio_lenguaje1`
    FOREIGN KEY (`id_lenguaje`)
    REFERENCES `seap_uta`.`lenguaje` (`id_lenguaje`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `seap_uta`.`maquina_virtual`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seap_uta`.`maquina_virtual` (
  `id_maquina_virtual` INT NOT NULL AUTO_INCREMENT,
  `id` VARCHAR(100) NOT NULL,
  `port` INT NOT NULL,
  `last_use` DATETIME NOT NULL,
  `id_repositorio` INT NOT NULL,
  PRIMARY KEY (`id_maquina_virtual`),
  UNIQUE INDEX `port_UNIQUE` (`port` ASC) VISIBLE,
  INDEX `fk_maquina_virtual_repositorio1_idx` (`id_repositorio` ASC) VISIBLE,
  UNIQUE INDEX `id_repositorio_UNIQUE` (`id_repositorio` ASC) VISIBLE,
  CONSTRAINT `fk_maquina_virtual_repositorio1`
    FOREIGN KEY (`id_repositorio`)
    REFERENCES `seap_uta`.`repositorio` (`id_repositorio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `seap_uta`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seap_uta`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `seap_uta`.`rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seap_uta`.`rol` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `seap_uta`.`miembro`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seap_uta`.`miembro` (
  `id_miembro` INT NOT NULL AUTO_INCREMENT,
  `id_rol` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_repositorio` INT NOT NULL,
  PRIMARY KEY (`id_miembro`),
  INDEX `fk_miembro_rol_idx` (`id_rol` ASC) VISIBLE,
  INDEX `fk_miembro_usuario1_idx` (`id_usuario` ASC) VISIBLE,
  INDEX `fk_miembro_repositorio1_idx` (`id_repositorio` ASC) VISIBLE,
  CONSTRAINT `fk_miembro_rol`
    FOREIGN KEY (`id_rol`)
    REFERENCES `seap_uta`.`rol` (`id_rol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_miembro_usuario1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `seap_uta`.`usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_miembro_repositorio1`
    FOREIGN KEY (`id_repositorio`)
    REFERENCES `seap_uta`.`repositorio` (`id_repositorio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `seap_uta`.`lenguaje`
-- -----------------------------------------------------
START TRANSACTION;
USE `seap_uta`;
INSERT INTO `seap_uta`.`lenguaje` (`id_lenguaje`, `name`, `image_id`) VALUES (1, 'Javascript', 'nodejs');
INSERT INTO `seap_uta`.`lenguaje` (`id_lenguaje`, `name`, `image_id`) VALUES (2, 'C', 'gcc');
INSERT INTO `seap_uta`.`lenguaje` (`id_lenguaje`, `name`, `image_id`) VALUES (3, 'C++', 'gcc');
INSERT INTO `seap_uta`.`lenguaje` (`id_lenguaje`, `name`, `image_id`) VALUES (4, 'Python3', 'python3');

COMMIT;


-- -----------------------------------------------------
-- Data for table `seap_uta`.`repositorio`
-- -----------------------------------------------------
START TRANSACTION;
USE `seap_uta`;
INSERT INTO `seap_uta`.`repositorio` (`id_repositorio`, `id_convergence`, `name`, `visibility`, `id_lenguaje`) VALUES (1, 'aabf9b6b-4ac3-4d90-94fb-d2230c920c6e', '_test', 1, 1);

COMMIT;


-- -----------------------------------------------------
-- Data for table `seap_uta`.`usuario`
-- -----------------------------------------------------
START TRANSACTION;
USE `seap_uta`;
INSERT INTO `seap_uta`.`usuario` (`id_usuario`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test');

COMMIT;


-- -----------------------------------------------------
-- Data for table `seap_uta`.`rol`
-- -----------------------------------------------------
START TRANSACTION;
USE `seap_uta`;
INSERT INTO `seap_uta`.`rol` (`id_rol`, `name`, `description`) VALUES (1, 'Creador', 'Creador del repositorio, puede eliminarlo de la plataforma.');
INSERT INTO `seap_uta`.`rol` (`id_rol`, `name`, `description`) VALUES (2, 'Administrador', 'Encargado de gestionar miembros.');
INSERT INTO `seap_uta`.`rol` (`id_rol`, `name`, `description`) VALUES (3, 'Editor', 'Permite gestionar los elementos del repositorio.');
INSERT INTO `seap_uta`.`rol` (`id_rol`, `name`, `description`) VALUES (4, 'Lector', 'Puede observar el repositorio.');

COMMIT;


-- -----------------------------------------------------
-- Data for table `seap_uta`.`miembro`
-- -----------------------------------------------------
START TRANSACTION;
USE `seap_uta`;
INSERT INTO `seap_uta`.`miembro` (`id_miembro`, `id_rol`, `id_usuario`, `id_repositorio`) VALUES (1, 1, 1, 1);

COMMIT;

