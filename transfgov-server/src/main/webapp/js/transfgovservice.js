/**
 * Uma classe service que permite acesso a métodos da API do TransfGov.
 * 
 * Nenhum tratamento de erro por enquanto.
 */

// Parâmetros
var MUNICIPIO = "{MUNICIPIO}";
var ANO = "{ANO}";
var MES = "{MES}";
var AGREGACAO = "{AGREGACAO}";
var SIGLA = "{SIGLA}";

var URL_BASE = "/transfgov/rest/";
var URL_ANOS = URL_BASE + "ano";
var URL_ESTADOS = URL_BASE + "estado";
var URL_AGREGACAO = URL_BASE + "agregacao";
var URL_AREAS = URL_BASE + "area";
var URL_TRANF_POR_MES_MUN = URL_BASE + "transferencia/" + ANO + "/" + MES + "/municipio/" + MUNICIPIO;
var URL_AGREGA_ANO_MES_MUN = URL_AGREGACAO + "/" + AGREGACAO + "/" + ANO + "/" + MES + "/municipio/" + MUNICIPIO;
var URL_AGREGA_ANO_MUN = URL_AGREGACAO + "/ANO/" + ANO + "/" + AGREGACAO + "/municipio/" +  MUNICIPIO;
var URL_MUN_POR_ESTADO = URL_ESTADOS + "/" + SIGLA + "/municipios";

var prefixoMeses = [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago",
             		"Set", "Out", "Nov", "Dez" ];

var TransfGovService = function($http) {
	
	this.anos = function(sucesso) {
		$http.get(URL_ANOS).success(sucesso);
	};

	this.estados = function(sucesso) {
		$http.get(URL_ESTADOS).success(function(estados) {
			estados.sort(function(a, b) {
				if (a.sigla < b.sigla)
					return -1;
				if (a.sigla > b.sigla)
					return 1;
				return 0;

			});
			sucesso(estados);
		});
	};
	
	
	this.municipiosPorEstado = function(sigla, sucesso) {
		var url = URL_MUN_POR_ESTADO.replace(SIGLA, sigla);
		$http.get(url).success(sucesso);
	};
	
	this.transfPorAnoMesMunicipio = function(ano, mes, id, sucesso) {
		var url = URL_TRANF_POR_MES_MUN
					.replace(ANO, ano).replace(MES, mes).replace(MUNICIPIO, id);
		this.dadosPaginados(url, sucesso);
    };
	
    this.agregacaoPorAnoMesMun = function(agregacao, ano, mes, municipio, sucesso) {
    	var url = URL_AGREGA_ANO_MES_MUN.replace(AGREGACAO, agregacao)
    			.replace(ANO, ano).replace(MES, mes).replace(MUNICIPIO, municipio);
    	$http.get(url).success(sucesso);
    };
    
    this.agregacaoPorAnoMun = function(agregacao, ano, municipio, sucesso) {
    	var url = URL_AGREGA_ANO_MUN.replace(AGREGACAO, agregacao)
    			.replace(ANO, ano).replace(MUNICIPIO, municipio);
    	$http.get(url).success(sucesso);
    };    
    
	this.dadosPaginados = function(urlTransfPaginada, sucesso) {
		$http.get(urlTransfPaginada).success(function(dados, status, headers, config) {
			var linkAnterior, linkProxima;
			headers('Link').split(",").forEach(function(l) {
				var link = parseLink(l);
				if (link.rel == 'next') {
					linkProxima = link;
				}
				if (link.rel == 'prev') {
					linkAnterior = link;
				}
			});
			sucesso(dados, linkAnterior, linkProxima);
		});	
	}

	this.agregacoes = function(sucesso) {
		$http.get(URL_AGREGACAO).success(
				function(agregacoes) {
					var agregacoesFiltradas = $.grep(agregacoes, function(agregacao) {
						return agregacao != 'MUNICIPIO' && agregacao != 'MES'
								&& agregacao != 'ANO';
					});
					sucesso(agregacoesFiltradas);
				});
	}
}

/*
 * Gambiarra para fazer parse dos links do header...
 */
function parseLink(l) {
	var link = {};
	var fields = l.split(';');
	link.url = fields[0].replace('<', '').replace('>', '');
	link.rel = fields[1].replace(' rel="', '').replace('"', '');
	link.title = fields[2].replace(' title="', '').replace('"', '');
	return link;
}