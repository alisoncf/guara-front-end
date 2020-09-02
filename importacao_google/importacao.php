#!/usr/bin/php
<?php
$loader['locais'][] = '';
$loader['dependencias'][] = '../../html/library/';
include("../../html/library/AutoLoader.php5");
AutoLoader::init();
include '../config/config_banco.php';

$tdg = TDG::getInstance();
$pastaFiles = __DIR__ . '/arquivos/';
$pastaLogs = __DIR__ . '/arquivos/log/';
$sqlGeral = '';
$start = Util::getStartExecutionTime();
echo "Inicio: " . date('d-m-Y H:i:s', $start);
echo "\n";

if (is_dir($pastaFiles)) {
	if ($dh = opendir($pastaFiles)) {
		while (($file = readdir($dh)) !== false) {
			if (in_array($file, ['.', '..']) || is_dir($pastaFiles . $file)) {
				continue;
			}
			$arquivo = $pastaFiles . $file;
			list($id, $ext) = explode('.', $file);
			if ($fh = fopen($arquivo, 'r')) {
				$cpf_nao_encontrado = '';
				while (!feof($fh)) {
					$line = fgets($fh);
					if (strlen($line) == 0) {
						continue;
					}
					$linhaArranjo = explode(',', $line);
					if (!is_numeric($linhaArranjo[10])) {
						$cpf_nao_encontrado .= $cpf_nao_encontrado == '' ? (implode(',', $linhaArranjo)) : ("\n" . implode(',', $linhaArranjo));
						continue;
					} 
					$cpf = $linhaArranjo[10];
					$pessoa = getPessoa($cpf);
					if (count($pessoa) > 0) {
						$sqlGeral .= "
									INSERT INTO ueg.vinculacao_administrativo (ref_motivo_inicio, aud_usrcpf, dt_criacao, ref_departamento, fk_vinculos, dt_inicio) 
									VALUES(, '86458256191', now(), $id, {$pessoa[0]['id']}, '');";
					} else {
						
					}
				}
				fclose($fh);
			}
		}
		closedir($dh);
		criarArquivo($pastaLogs.'cpf_nao_encontrado.csv', $cpf_nao_encontrado);
		Debug::tail($sqlGeral, $pastaLogs . "log.sql");
//		TDG::getInstance()->genericQuery($sqlGeral);
	}
}
$fim = Util::getElapsedExecutionTime($start);
echo "Fim:    " . date('d-m-Y H:i:s', $start + $fim);
echo "\n";

function getPessoa(string $cpf) {
	$cpfFormatado = Conversor::somenteNumero($cpf);
	$sql = "select distinct pf.nome, pf.cpf, v.id
			from ueg.vinculos v 
			join ueg.pessoas_fisicas pf on v.ref_pessoa = pf.id
			join ueg.lotacoes l on l.fk_vinculos = v.id and (l.dt_fim is null or l.dt_fim > now()::date) -- and l.is_ativo is true
			WHERE (v.dt_desativacao is null or v.dt_desativacao >=  now()::date)
			and v.ref_tipo_v in(2) AND pf.cpf = '$cpfFormatado'";
	return TDG::getInstance()->genericQuery($sql);
}

function criarArquivo($file, $message) {
	$fp = fopen($file, 'a');
	if (!$fp) {
		return;
	}
	fwrite($fp, $message);
	fclose($fp);
}
