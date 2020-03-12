#!/usr/bin/php
<?php
$loader['locais'][] = '';
$loader['dependencias'][] = '../library/';
include("../library/AutoLoader.php5");
AutoLoader::init();
include './config/config_banco.php';

$tdg = TDG::getInstance();
$pastaFiles = __DIR__ . '/files/';
$sqlGeral = '';
$start = Util::getStartExecutionTime();
echo "Inicio: " . date('d-m-Y H:i:s', $start);
echo "\n";
$refMotivoGestao = 13; //Inclusao
$dataAtivacao = '2020-02-28';
if (is_dir($pastaFiles)) {
	if ($dh = opendir($pastaFiles)) {
		while (($file = readdir($dh)) !== false) {
			if (in_array($file, ['.', '..'])) {
				continue;
			}
			$arquivo = $pastaFiles . $file;
			list($id, $ext) = explode('.', $file);
			if ($fh = fopen($arquivo, 'r')) {
				while (!feof($fh)) {
					$line = fgets($fh);
					if (strlen($line) == 0) {
						continue;
					}
					list($nome, $cpf) = explode(',', $line);
					if (Conversor::somenteNumero($cpf) == '72210214149') {
						Util::shellDebug($cpf . " e " . $nome . "");
					}
					$pessoa = getPessoa($cpf);
					if (count($pessoa) > 0) {
						$sqlGeral .= "
									INSERT INTO ueg.vinculacao_administrativo (ref_motivo_inicio, aud_usrcpf, dt_criacao, ref_departamento, fk_vinculos, dt_inicio) 
									VALUES($refMotivoGestao, '86458256191', now(), $id, {$pessoa[0]['id']}, '$dataAtivacao');";
					} else {
						Util::shellDebug($cpf . " e " . $nome . " não encontrado");
					}
				}
				fclose($fh);
			}
		}
		closedir($dh);
		Debug::tail($sqlGeral,$pastaFiles."insertVinculacaoAdm.sql");
//		TDG::getInstance()->genericQuery($sqlGeral);
	}
}
$fim = Util::getElapsedExecutionTime($start);
echo "Fim:    " . date('d-m-Y H:i:s', $start + $fim);
echo "\n";

function getPessoa($cpf) {
	$cpf = Conversor::somenteNumero($cpf);
	$sql = "select distinct pf.nome, pf.cpf, v.id
			from ueg.vinculos v 
			join ueg.pessoas_fisicas pf on v.ref_pessoa = pf.id
			join ueg.lotacoes l on l.fk_vinculos = v.id and (l.dt_fim is null or l.dt_fim > now()::date) -- and l.is_ativo is true
			WHERE (v.dt_desativacao is null or v.dt_desativacao >=  now()::date)
			and v.ref_tipo_v in(2) AND pf.cpf = '$cpf'";
	return TDG::getInstance()->genericQuery($sql);
}
