CREATE DATABASE staff_managment;
USE staff_managment;

CREATE TABLE shifts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
);

CREATE TABLE shift_days (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    shift_id INT UNSIGNED NOT NULL,
    day ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

CREATE TABLE staffs (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number CHAR(10) NOT NULL,
    role ENUM('Chef','Waiter','Cleaner','Cashier','Manager') NOT NULL,
    active TINYINT(1) DEFAULT 1,
    shift_id INT UNSIGNED,
    
    FOREIGN KEY (shift_id) 
        REFERENCES shifts(id)
        ON UPDATE CASCADE 
        ON DELETE SET NULL
);


CREATE TABLE attendance (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    staff_id INT UNSIGNED NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME NOT NULL,

    FOREIGN KEY (staff_id)
        REFERENCES staffs(id)
        ON UPDATE CASCADE
);