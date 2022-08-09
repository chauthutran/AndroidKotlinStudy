function JsonBuiltTable() { };

// TODO: NEED TO MOVE TO A CLASS (STATIC, UTIL)
JsonBuiltTable.buildTable = function (a) {
	var e = document.createElement("table"), d, b;
	if (JsonBuiltTable.isArray(a))
		return JsonBuiltTable.buildArray(a);
	for (var c in a)
		"object" != typeof a[c] || JsonBuiltTable.isArray(a[c]) ? "object" == typeof a[c] && JsonBuiltTable.isArray(a[c]) ? (d = e.insertRow(-1),
			b = d.insertCell(-1),
			b.colSpan = 2,
			b.innerHTML = '<div class="bt_td_head">' + JsonBuiltTable.encodeText(c) + '</div><table style="width:100%">' + $(JsonBuiltTable.buildArray(a[c]), !1).html() + "</table>") : (d = e.insertRow(-1),
				b = d.insertCell(-1),
				b.innerHTML = "<div class='bt_td_head'>" + JsonBuiltTable.encodeText(c) + "</div>",
				d = d.insertCell(-1),
				d.innerHTML = "<div class='bt_td_row_even'>" + JsonBuiltTable.encodeText(a[c]) + "</div>") : (d = e.insertRow(-1),
					b = d.insertCell(-1),
					b.colSpan = 2,
					b.innerHTML = '<div class="bt_td_head">' + JsonBuiltTable.encodeText(c) + '</div><table style="width:100%">' + $(JsonBuiltTable.buildTable(a[c]), !1).html() + "</table>");
	return e
};


JsonBuiltTable.buildArray = function (a) {
	var e = document.createElement("table"), d, b, c = !1, p = !1, m = {}, h = -1, n = 0, l;
	l = "";
	if (0 == a.length)
		return "<div></div>";
	d = e.insertRow(-1);
	for (var f = 0; f < a.length; f++)
		if ("object" != typeof a[f] || JsonBuiltTable.isArray(a[f]))
			"object" == typeof a[f] && JsonBuiltTable.isArray(a[f]) ? (b = d.insertCell(h),
				b.colSpan = 2,
				b.innerHTML = '<div class="bt_td_head"></div><table style="width:100%">' + $(JsonBuiltTable.buildArray(a[f]), !1).html() + "</table>",
				c = !0) : p || (h += 1,
					p = !0,
					b = d.insertCell(h),
					m.empty = h,
					b.innerHTML = "<div class='bt_td_head'>&nbsp;</div>");
		else
			for (var k in a[f])
				l = "-" + k,
					l in m || (c = !0,
						h += 1,
						b = d.insertCell(h),
						m[l] = h,
						b.innerHTML = "<div class='bt_td_head'>" + JsonBuiltTable.encodeText(k) + "</div>");
	c || e.deleteRow(0);
	n = h + 1;
	for (f = 0; f < a.length; f++)
		if (d = e.insertRow(-1),
			td_class = JsonBuiltTable.isEven(f) ? "bt_td_row_even" : "bt_td_row_odd",
			"object" != typeof a[f] || JsonBuiltTable.isArray(a[f]))
			if ("object" == typeof a[f] && JsonBuiltTable.isArray(a[f]))
				for (h = m.empty,
					c = 0; c < n; c++)
					b = d.insertCell(c),
						b.className = td_class,
						l = c == h ? '<table style="width:100%">' + $(JsonBuiltTable.buildArray(a[f]), !1).html() + "</table>" : " ",
						b.innerHTML = "<div class='" + td_class + "'>" + JsonBuiltTable.encodeText(l) + "</div>";
			else
				for (h = m.empty,
					c = 0; c < n; c++)
					b = d.insertCell(c),
						l = c == h ? a[f] : " ",
						b.className = td_class,
						b.innerHTML = "<div class='" + td_class + "'>" + JsonBuiltTable.encodeText(l) + "</div>";
		else {
			for (c = 0; c < n; c++)
				b = d.insertCell(c),
					b.className = td_class,
					b.innerHTML = "<div class='" + td_class + "'>&nbsp;</div>";
			for (k in a[f])
				c = a[f],
					l = "-" + k,
					h = m[l],
					b = d.cells[h],
					b.className = td_class,
					"object" != typeof c[k] || JsonBuiltTable.isArray(c[k]) ? "object" == typeof c[k] && JsonBuiltTable.isArray(c[k]) ? b.innerHTML = '<table style="width:100%">' + $(JsonBuiltTable.buildArray(c[k]), !1).html() + "</table>" : b.innerHTML = "<div class='" + td_class + "'>" + JsonBuiltTable.encodeText(c[k]) + "</div>" : b.innerHTML = '<table style="width:100%">' + $(JsonBuiltTable.buildTable(c[k]), !1).html() + "</table>"
		}
	return e
};


JsonBuiltTable.encodeText = function (a) {
	return $("<div />").text(a).html()
};


JsonBuiltTable.isArray = function (a) {
	return "[object Array]" === Object.prototype.toString.call(a)
};


JsonBuiltTable.isEven = function (a) {
	return 0 == a % 2
}
JsonBuiltTable.buildTree = function (a, e, d) {
	e += 1;
	if ("undefined" === typeof a)
		JsonBuiltTable.log("undef!!", e);
	else
		for (var b in a)
			if ("object" == typeof a[b]) {
				var c = JsonBuiltTable.addTree(b, d, JsonBuiltTable.isArray(a[b]));
				JsonBuiltTable.buildTree(a[b], e, c)
			} else
				JsonBuiltTable.addLeaf(b, a, d)
}
JsonBuiltTable.addTree = function (a, e, d) {
	var b = "lbl_obj";
	d && (b = "lbl_array");
	var c = "_" + Math.random().toString(36).substr(2, 9);
	d = document.createElement("li");
	d.innerHTML = "<label for='" + c + "' class='" + b + "'>" + JsonBuiltTable.encodeText(a) + "</label> <input type='checkbox' checked id='" + c + "' />";
	a = document.createElement("ol");
	d.appendChild(a);
	null != e && e.appendChild(d);
	return a
}
JsonBuiltTable.addLeaf = function (a, e, d) {
	var b = "";
	JsonBuiltTable.isArray(e) || (b = a + ":");
	b += e[a];
	Math.random().toString(36).substr(2, 9);
	a = document.createElement("li");
	a.className = "file";
	a.innerHTML = "<a>" + JsonBuiltTable.encodeText(b) + "</a>";
	d.appendChild(a)
}