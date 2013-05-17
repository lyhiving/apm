<?php

// 上传图片至 tps 系统
require_once('./Snoopy.php');
$snoopy = new Snoopy();
$snoopy->_submit_type = 'multipart/form-data';
$dirname = dirname($_FILES['photo']['tmp_name']);
@rename($_FILES['photo']['tmp_name'], $_FILES['photo']['tmp_name'] = $dirname . '\\' . $_FILES['photo']['name']);
$snoopy->submit('http://tps.tms.taobao.com/photo/upload.htm?_input_charset=utf-8', $_REQUEST, $_FILES);
echo $snoopy->results;

?>