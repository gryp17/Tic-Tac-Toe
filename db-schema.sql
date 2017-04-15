
CREATE TABLE `user` (
  `id` int(11) PRIMARY KEY,
  `username` varchar(20) NOT NULL,
  `password` varchar(40) NOT NULL,
  `avatar` varchar(40) DEFAULT NULL,
  `created` datetime NOT NULL
);