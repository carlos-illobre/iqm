
create database qdm;
 
use qdm;
 
create table users (
    idUser int(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userName varchar(20) NOT NULL UNIQUE,
    email varchar(40) NOT NULL UNIQUE,
    password varchar(30) NOT NULL,
    stateId int(3) NOT NULL
);

alter table users add email_validation_key varchar(40);
alter table users add email_validation_key_expiration varchar(40);
 
create table admin_users (
    id int(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userName varchar(20) NOT NULL UNIQUE,
    password varchar(30) NOT NULL
);
 
INSERT INTO admin_users (userName, password) VALUES ('admin', 'admin');
 
DELIMITER //
CREATE PROCEDURE showCoins(username varchar(20), password varchar(30))
BEGIN
    SELECT LENGTH(username) coins;
END //

CREATE PROCEDURE showPackages(username varchar(20))
BEGIN
    SELECT LENGTH(username) packages;
END //
 
CREATE PROCEDURE showPackage(username varchar(20), packageId int)
BEGIN
    SELECT LENGTH(username) packageId;
END //
 
CREATE PROCEDURE myFriends(username varchar(20), auctionId int)
BEGIN
    SELECT LENGTH(username) auctionId;
END //
 
CREATE PROCEDURE newOffer(username varchar(20), auction int, amoun int, out res int, out pos int, out coin int)
BEGIN
    set res = amoun;
    set pos = auction;
    set coin = 99;
END //
 
CREATE PROCEDURE myBids(username varchar(20), auctionId int)
BEGIN
    SELECT LENGTH(username) bids;
END //
 
CREATE PROCEDURE showAuctionsAll(fromm int, too int)
BEGIN
    SELECT fromm + too showAuctionsAll;
END //
 
CREATE PROCEDURE showAuction(aucid int)
BEGIN
    SELECT aucid showAuction;
END //
 
CREATE PROCEDURE showGralTable(fromm int, too int)
BEGIN
    SELECT fromm + too showGralTable;
END //
 
CREATE PROCEDURE showAuctionByCategory(category int)
BEGIN
    SELECT category showAuctionByCategory;
END //
 
DELIMITER ; //

