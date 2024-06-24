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
				$cpf_nao_informado = '';
				$cpf_nao_encontrado = '';
				$cpf_duplicado = '';
				$email_ja_cadastrado = '';
				while (!feof($fh)) {
					$linhaArranjo = fgetcsv($fh);
					if(!isset($linhaArranjo[10])){
						Util::shellDebug($linhaArranjo);
						//linha incompleta
						continue;
					}
					$cpf = Conversor::somenteNumero($linhaArranjo[10]);
					if (!is_numeric($cpf)) {
						$cpf_nao_informado.= $cpf_nao_informado == '' ? (implode(',', $linhaArranjo)) : ("\n" . implode(',', $linhaArranjo));
						continue;
					}
					$pessoa = getPessoa($cpf);
					if (count($pessoa) == 1) {
						$emailUeg = trim($linhaArranjo[2]);
						if($emailUeg == trim($pessoa[0]['email'])){
							$email_ja_cadastrado.= $email_ja_cadastrado == '' ? (implode(',', $linhaArranjo)) : ("\n" . implode(',', $linhaArranjo));
						}else {
							$sqlGeral .= "update ueg.pessoas_fisicas set email_alt = email, email = '$emailUeg' where id = '{$pessoa[0]['id']}'; \n";
						}						
					}elseif (count($pessoa) > 1) {
						$cpf_duplicado.= $cpf_duplicado == '' ? (implode(',', $linhaArranjo)) : ("\n" . implode(',', $linhaArranjo));
					} else{
						$cpf_nao_encontrado.= $cpf_nao_encontrado == '' ? (implode(',', $linhaArranjo)) : ("\n" . implode(',', $linhaArranjo));
					} 
				}
				fclose($fh);
			}
		}
		closedir($dh);
		criarArquivo($pastaLogs.'cpf_nao_informado.csv', $cpf_nao_informado);
		criarArquivo($pastaLogs.'cpf_nao_encontrado.csv', $cpf_nao_encontrado);
		criarArquivo($pastaLogs.'cpf_duplicado.csv', $cpf_duplicado);
		criarArquivo($pastaLogs.'email_ja_cadastrado.csv', $email_ja_cadastrado);
		criarArquivo($pastaLogs.'sqlGeral.sql', $sqlGeral);		
//		Debug::tail($sqlGeral, $pastaLogs . "log.sql");
//		TDG::getInstance()->genericQuery($sqlGeral);
	}
}
$fim = Util::getElapsedExecutionTime($start);
echo "Fim:    " . date('d-m-Y H:i:s', $start + $fim);
echo "\n";


function printTime($start) {
	$fim = Util::getElapsedExecutionTime($start);
	echo "Tempo:    " . date('d-m-Y H:i:s', $start + $fim)."\n";
}

function getPessoa(string $cpf) {
	$cpfFormatado = Conversor::somenteNumero($cpf);
	$sql = "select distinct pf.nome, pf.cpf, pf.id, pf.email
			from ueg.pessoas_fisicas pf 
			WHERE pf.cpf like '%$cpfFormatado'
			order by pf.id desc
			limit 1";
	$return = TDG::getInstance()->genericQuery($sql);
	return $return;
}

function criarArquivo($file, $message) {
	$fp = fopen($file, 'a');
	if (!$fp) {
		return;
	}
	fwrite($fp, $message);
	fclose($fp);
}
