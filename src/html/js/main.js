$(document).ready(function(){
	$.get('/version')
	.done(data => {
		var table = $('<table></table>');
		$('#details').append(table);
		for(var key in data){
			var tr = $('<tr></tr>');
			table.append(tr);
			var td = $('<td></td>');
			tr.append(td);
			td.html(key);
			var td = $('<td></td>');
			tr.append(td);
			td.html(data[key]);
		}
	})
});