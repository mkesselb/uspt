-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 05. Okt 2016 um 14:20
-- Server-Version: 10.1.16-MariaDB
-- PHP-Version: 5.6.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `uspt`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `first_name` varchar(20) COLLATE utf8_bin NOT NULL,
  `last_name` varchar(20) COLLATE utf8_bin NOT NULL,
  `sex` varchar(1) CHARACTER SET latin1 NOT NULL,
  `birthday` char(8) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_data`
--

DROP TABLE IF EXISTS `survey_data`;
CREATE TABLE `survey_data` (
  `survey_id` int(11) NOT NULL,
  `survey_hash` char(128) COLLATE utf8_bin NOT NULL,
  `survey_key` varchar(20) COLLATE utf8_bin NOT NULL,
  `survey_answers` text COLLATE utf8_bin NOT NULL,
  `sex` varchar(1) COLLATE utf8_bin NOT NULL,
  `age` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `institution` varchar(20) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_hash_mapping`
--

DROP TABLE IF EXISTS `survey_hash_mapping`;
CREATE TABLE `survey_hash_mapping` (
  `survey_hash` char(128) COLLATE utf8_bin NOT NULL,
  `alt_survey_hash` char(128) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_participants`
--

DROP TABLE IF EXISTS `survey_participants`;
CREATE TABLE `survey_participants` (
  `student_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `survey_key` varchar(20) CHARACTER SET latin1 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`);

--
-- Indizes für die Tabelle `survey_data`
--
ALTER TABLE `survey_data`
  ADD PRIMARY KEY (`survey_id`),
  ADD KEY `survey_hash` (`survey_hash`);

--
-- Indizes für die Tabelle `survey_hash_mapping`
--
ALTER TABLE `survey_hash_mapping`
  ADD PRIMARY KEY (`survey_hash`,`alt_survey_hash`);

--
-- Indizes für die Tabelle `survey_participants`
--
ALTER TABLE `survey_participants`
  ADD PRIMARY KEY (`student_id`,`survey_key`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT für Tabelle `survey_data`
--
ALTER TABLE `survey_data`
  MODIFY `survey_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `survey_hash_mapping`
--
ALTER TABLE `survey_hash_mapping`
  ADD CONSTRAINT `survey_hash_mapping_ibfk_1` FOREIGN KEY (`survey_hash`) REFERENCES `survey_data` (`survey_hash`);

--
-- Constraints der Tabelle `survey_participants`
--
ALTER TABLE `survey_participants`
  ADD CONSTRAINT `survey_participants_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
