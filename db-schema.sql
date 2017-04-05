
CREATE TABLE `user` (
  `id` int(11) PRIMARY KEY,
  `username` varchar(20) NOT NULL,
  `password` varchar(40) NOT NULL,
  `created` datetime NOT NULL
);