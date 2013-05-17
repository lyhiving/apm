<!DOCTYPE html>
<html class="apm-base">
<head>
	<meta charset="utf-8">
	<title>apm - 0.9.0</title>
	<link rel="stylesheet" href="./apm.css">
</head>
<body>
<div class="admin">
	<ul class="admin-menu">
		<li><span class="head-add">添加页头图片<input type="file" data-area="area-head"></span></li>
		<li><span class="foot-add">添加页尾图片<input type="file" data-area="area-foot"></span></li>
		<li><button class="area-add" data-area="area-head">添加页头热区</button></li>
		<li><button class="area-add" data-area="area-foot">添加页尾热区</button></li>
		<li><button class="area-add" data-area="area-body">添加普通热区</button></li>
	</ul>
</div>
<div class="viewport">
	<div class="area area-head"></div>
	<div class="area area-body">
		<a class="area-item" href="#" data-transition="pop"></a>
	</div>
	<div class="area area-foot"></div>
</div>
<script src="./libs/jquery/2.0.0/jquery.js"></script>
<script src="./libs/jquery.jqdnr/1.0.0/jquery.jqdnr.js"></script>
<script src="./libs/mustache/0.7.2/mustache.js"></script>
<script src="./apm.js"></script>
</body>
</html>