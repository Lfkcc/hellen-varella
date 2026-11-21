# -*- coding: utf-8 -*-
"""Preenche o modelo de relatório de extensão da Parte II."""
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph

PASTA = Path(__file__).resolve().parent
SRC = PASTA / "modelo-relatorio.docx"
OUT = PASTA / "relatorio-de-extensao.docx"


def set_text(paragraph, text):
    if paragraph.runs:
        paragraph.runs[0].text = text
        for run in paragraph.runs[1:]:
            run.text = ""
    else:
        paragraph.add_run(text)


def insert_after(paragraph, text):
    new_p = deepcopy(paragraph._p)
    paragraph._p.addnext(new_p)
    new_para = Paragraph(new_p, paragraph._parent)
    set_text(new_para, text)
    return new_para


def fill_next(doc, prefix, blocks):
    paras = doc.paragraphs
    for i, p in enumerate(paras):
        if p.text.strip().startswith(prefix):
            target = paras[i + 1]
            set_text(target, blocks[0])
            anchor = target
            for block in blocks[1:]:
                anchor = insert_after(anchor, block)
            return
    raise SystemExit(f"não achei: {prefix}")


def main():
    if not SRC.is_file():
        raise SystemExit(
            "Falta facul/modelo-relatorio.docx (o modelo em branco da disciplina). "
            "O script grava só facul/relatorio-de-extensao.docx."
        )
    doc = Document(str(SRC))

    for p in doc.paragraphs:
        if p.text.strip().startswith("(   ) Escola Politécnica"):
            set_text(p, "( X ) Escola Politécnica")

    fill_next(
        doc,
        "2.",
        [
            "Vitrine web do Studio Hellen Varella: maquiagem, cabelo e fotografia no mesmo atendimento"
        ],
    )
    fill_next(
        doc,
        "3.",
        [
            "O projeto constrói o sistema web de uma microempreendedora individual de Fraiburgo/SC, a Hellen Luci Varella, dona de um studio que reúne maquiagem, cabelo e fotografia num único atendimento. A reserva permanece no WhatsApp, canal que ela já usa. O site guarda o que o Instagram não segura: a frase da marca, o diferencial, os serviços, os preços e o caminho para agendar.",
            "A Parte II registra a análise de requisitos (a partir do briefing escrito por ela e de pesquisa pública do mercado local), o protótipo das telas para validação e o cronograma que também cobre a etapa III. A publicação com fotos reais e o relatório atualizado ficam para a etapa seguinte.",
        ],
    )
    fill_next(
        doc,
        "4.",
        [
            "A extensão universitária, tornada obrigatória pela Resolução CNE/CES nº 7, de 18 de dezembro de 2018, pede que o estudante aplique o conhecimento do curso numa demanda real da comunidade. A demanda aqui é de uma MEI da área de estética, ativa desde 21/05/2019 (CNPJ 33.687.461/0001-33), que apresenta o trabalho sobretudo pelo Instagram e fecha horário no WhatsApp.",
            "Ela mesma descreveu o problema de posicionamento: em Fraiburgo há muitos profissionais de beleza e muitos fotógrafos, e o que a distingue é entregar produção e ensaio no mesmo lugar. Sem uma página estável, preço, incluso e regra de reserva se perdem em conversa e em story.",
            "O projeto se liga à formação da Escola Politécnica em engenharia de requisitos e em desenvolvimento de sistema web. Os ODS usados como critério são o 8 (meta 8.3, formalização e crescimento de microempresas) e o 5 (meta 5.5, trabalho de uma mulher à frente do próprio negócio, com público majoritariamente de mulheres). A ferramenta foi desenhada para ela manter sem mensalidade de plataforma.",
        ],
    )
    fill_next(
        doc,
        "5.",
        [
            "Fraiburgo é cidade pequena do meio-oeste catarinense. Consulta pública em 13/10/2026 (GuiaPJ e fichas de estabelecimentos) mostra a Hellen como MEI de estética, telefone (49) 99829-3732, e dezenas de outras empresas ativas no mesmo CNAE no município. Salões e estúdios de maquiagem (entre eles Salão Beleza Pura, Fran Thais Studio e Juliana Dalbosco) convivem com fotógrafos. Há ainda uma ficha chamada Estúdio Inspire Fotografia e Maquiagem: fica como pergunta para ela, porque o nome junta dois ofícios e pode ou não ser o mesmo combo que ela oferece.",
            "A relação com a comunidade já começou pelo briefing que a própria Hellen escreveu (posicionamento, público, persona, paleta, o que a marca não pode parecer). A vitrine em construção usa esse texto. Endereço, e-mail, horário e o link curto de WhatsApp aparecem em cadastros públicos com divergências (Rua Suíça 117 no CNPJ e 129 numa ficha; dois links de WhatsApp). Nada disso será publicado até ela confirmar.",
            "Atividades anteriores no mesmo projeto: leitura do briefing, direção visual e uma vitrine em HTML já navegável. A Parte II formaliza requisitos e protótipo. A Parte III leva o retorno dela para o sistema publicado.",
        ],
    )
    fill_next(
        doc,
        "6.",
        [
            "Objetivo geral: disponibilizar um sistema web que apresente o Studio Hellen Varella na identidade definida pela microempreendedora e encaminhe a reserva ao WhatsApp.",
            "Objetivos específicos: (1) levantar e classificar os requisitos de conteúdo, de função e de design a partir da demanda dela; (2) prototipar as telas e validá-las com a Hellen; (3) na etapa III, concluir o sistema com o que ela aprovar, inclusive fotos e dados de contato, e publicar em endereço estável; (4) avaliar se uma visitante entende o diferencial, o preço e como reservar, e se a Hellen se reconhece na marca.",
        ],
    )
    fill_next(
        doc,
        "7.",
        [
            "Beneficiária direta: Hellen Luci Varella, microempreendedora individual em Fraiburgo/SC, atividade de estética e outros cuidados com a beleza, com ensino e cabelo entre as atividades secundárias do cartão. Porte micro, Simples Nacional, capital social registrado de R$ 3.000,00. O sistema é a presença digital própria do negócio, sem custo de plataforma para ela.",
            "Beneficiário indireto: as clientes do studio. No briefing, são mulheres de todas as idades, de crianças a idosas, em maior número adolescentes e mães, que buscam um ambiente acolhedor e a praticidade de resolver cabelo, maquiagem e fotografia no mesmo atendimento. O projeto não coleta dado dessas clientes.",
        ],
    )
    fill_next(
        doc,
        "8.",
        [
            "A metodologia segue os objetivos e os dois ODS. Elicitação por análise do briefing escrito pela Hellen, análise da oferta que ela já pratica, pesquisa pública de mercado em Fraiburgo e brainstorm do que a página precisa resolver antes da conversa. Especificação em requisitos funcionais, não funcionais, regras de negócio e casos de uso. Validação por protótipo percorrido por ela (questionário ou áudio no WhatsApp).",
            "O desenvolvimento é incremental: HTML, CSS e JavaScript no navegador, conteúdo em arquivos de dados, sem login e sem formulário. Isso atende a meta 8.3 porque entrega um canal estável a uma MEI, com manutenção simples. Atende a meta 5.5 porque o trabalho é o de uma mulher à frente do studio e a comunicação evita o estereótipo de salão genérico que ela rejeitou. Cada encontro com ela entra no cronograma como atividade, não como etapa informal.",
            "Na etapa III a mesma metodologia continua: o retorno vira ajuste, teste no celular dela e atualização deste relatório.",
        ],
    )
    fill_next(
        doc,
        "9.",
        [
            "Sistema de página única, em português, responsivo, com uso principal no celular. Tecnologias: HTML, CSS e JavaScript, sem framework, sem banco de dados e sem servidor de aplicação. A publicação prevista é de pasta estática (GitHub Pages, Netlify ou Cloudflare Pages). Compatibilidade: navegadores atuais de celular e de computador; os scripts também funcionam ao abrir o arquivo direto.",
            "Arquitetura: folhas de estilo em camadas (tokens da paleta dela, base, layout, componentes, utilidades); comportamento em scripts separados (menu, portfólio, links de WhatsApp, montagem de combo). O conteúdo editável fica em JSON (serviços, estúdio, perguntas), para trocar preço sem reescrever a página.",
            "Integração de terceiros: links wa.me e tel: para o número (49) 99829-3732; Instagram e Threads do perfil @hellenvarella.makeup; famílias de fonte servidas pelo Google Fonts (Poppins e, como substituta web da Perandory Condensed, Bodoni Moda). Não há API de pagamento, de login nem de agenda. Segurança desta versão: nenhum dado de cliente é armazenado; link externo usa rel noopener; depoimento, e-mail e endereço só entram com autorização explícita. Requisitos detalhados, casos de uso e pendências estão em facul/01-analise-de-requisitos.md.",
        ],
    )
    fill_next(
        doc,
        "12. COMUNICAÇÃO",
        [
            "Com a microempreendedora: WhatsApp, que já é o canal do studio, mais o protótipo para ela abrir no celular e o questionário (pode responder por áudio). Videochamada ou encontro presencial, se ocorrerem, também entram como evidência.",
            "Com a comunidade das clientes: o próprio site e o Instagram dela. Não há campanha paga nesta etapa. Depoimento de cliente só é republicado com autorização.",
            "Divulgação acadêmica: este relatório e a apresentação na disciplina. A versão pública do trabalho não precisa expor print com dado pessoal além do contato comercial que ela já divulga.",
        ],
    )
    fill_next(
        doc,
        "12. CRONOGRAMA",
        [
            "Proposta de trabalho a partir de 13/10/2026. O prazo oficial é o da intranet; se a data da disciplina for outra, as semanas se deslocam e a etapa III atualiza este quadro. A coluna Semanas indica em que período a atividade acontece. As linhas da etapa III estão previstas e serão revistas com o retorno da Hellen."
        ],
    )
    fill_next(
        doc,
        "13.",
        [
            "Acadêmico: Luiz. Função nesta etapa: análise de requisitos, protótipo das telas e preenchimento do relatório. Carga horária: a lançar no Sistema da Univali.",
            "Demais integrantes do grupo: completar com nome, curso e função.",
            "Docente orientador: a informar no Sistema da Univali. Função: orientação e avaliação da extensão.",
        ],
    )
    fill_next(
        doc,
        "14.",
        [
            "Não há custo para a microempreendedora nem licença paga nesta etapa. O desenvolvimento usa navegador, HTML, CSS e JavaScript, e o WhatsApp que ela já possui. Domínio, se for contratado na etapa III, será decidido com ela e lançado à parte. Valores exigidos pela coordenação serão digitados no Sistema da Univali."
        ],
    )
    fill_next(
        doc,
        "15.",
        [
            "BRASIL. Resolução CNE/CES nº 7, de 18 de dezembro de 2018. Estabelece as diretrizes para a extensão na educação superior.",
            "NAÇÕES UNIDAS. Objetivos de Desenvolvimento Sustentável 5 e 8. Disponível em: https://brasil.un.org/pt-br/sdgs.",
            "PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.",
            "SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2019.",
            "VARELLA, Hellen. Meu briefing (documento da cliente, 4 páginas). Arquivo local Meu briefing.pdf.",
            "Cadastro público do CNPJ 33.687.461/0001-33. Consulta em 13 out. 2026. Disponível em: https://guiapj.com.br/consulta-cnpj/33687461000133.",
        ],
    )

    avaliacao = [
        (
            "Requisitos fiéis à demanda da Hellen",
            "Documento com requisitos classificados e pendências explícitas",
            "O site não anuncia serviço, preço ou equipe que ela não tenha confirmado",
            "Rastreio requisito–briefing e lista de perguntas abertas",
        ),
        (
            "Protótipo validado por ela",
            "Retorno sobre as 13 telas (questionário, áudio ou conversa)",
            "A microempreendedora se reconhece na marca publicada",
            "Arquivo em facul/anexos e registro em 03-evidencias.md",
        ),
        (
            "Visitante entende oferta e reserva",
            "Diferencial, preço e botão de WhatsApp encontrados sem ajuda",
            "Menos conversa só para perguntar preço e incluso",
            "Roteiro de teste no celular, com a Hellen, na etapa III",
        ),
        (
            "Presença digital própria no ar (etapa III)",
            "URL estável, com fotos e contatos que ela autorizar",
            "MEI com canal que não depende só de story",
            "Página acessível no celular e checklist de conteúdo",
        ),
    ]
    t0 = doc.tables[0]
    while len(t0.rows) < 1 + len(avaliacao):
        t0.add_row()
    for i, row in enumerate(avaliacao):
        for j, value in enumerate(row):
            t0.rows[i + 1].cells[j].text = value

    t1 = doc.tables[1]
    if len(t1.rows) < 3:
        t1.add_row()
    t1.rows[1].cells[0].text = "Studio Hellen Varella (Hellen Luci Varella, MEI)"
    t1.rows[1].cells[1].text = (
        "Fonte dos requisitos (briefing); validação do protótipo; "
        "confirmação de preços, contato e fotos; canal de comunicação com as clientes."
    )
    t1.rows[2].cells[0].text = "Univali — Escola Politécnica"
    t1.rows[2].cells[1].text = (
        "Orientação acadêmica, acompanhamento da extensão e avaliação do relatório."
    )

    semanas = [
        "13–19/10",
        "20–26/10",
        "27/10–02/11",
        "03–09/11",
        "10–16/11",
        "17–23/11",
        "24–30/11",
        "01–07/12",
    ]
    # Atividade, etapas II/III, e em quais índices de semana marca ●
    cron = [
        ("Releitura do briefing e documento de requisitos", "II", [0]),
        ("Pesquisa de área e concorrência em Fraiburgo", "II", [0]),
        ("Protótipo das 13 telas para a Hellen", "II", [0, 1]),
        ("Validação com a microempreendedora e evidência", "II", [1, 2]),
        ("Ajuste dos requisitos com o retorno dela", "II", [2]),
        ("Relatório de extensão desta etapa", "II", [2]),
        ("Implementar no site o que ela aprovar", "III", [3, 4]),
        ("Fotos e dados de contato autorizados", "III", [3, 4]),
        ("Teste no celular dela (menu, preço, WhatsApp)", "III", [5]),
        ("Publicação em endereço estável", "III", [6]),
        ("Repasse de como alterar preço e texto", "III", [6]),
        ("Avaliação de resultados e relatório atualizado", "III", [7]),
    ]
    t2 = doc.tables[2]
    # O modelo tem 5 colunas (atividade + 4 semanas de maio).
    # Reconstruímos o quadro em linhas: atividade | etapa | semanas marcadas,
    # usando as 5 colunas existentes de forma legível em retrato.
    header = ["Atividade", "Etapa", "Semanas", "Situação em 13/10/2026", "Produto"]
    for j, value in enumerate(header):
        t2.rows[0].cells[j].text = value
    situacao = {
        0: "Em elaboração neste relatório",
        1: "Feita; achados na análise",
        2: "Protótipo pronto para mostrar",
        3: "A realizar",
        4: "A realizar",
        5: "Esta versão",
    }
    produto = [
        "01-analise-de-requisitos.md",
        "Seção de diagnóstico",
        "prototipo/index.html",
        "Resposta em anexos/",
        "Requisitos atualizados",
        "relatorio-de-extensao.docx",
        "Vitrine ajustada",
        "Checklist de conteúdo",
        "Roteiro de teste respondido",
        "URL no ar",
        "Nota curta de atualização",
        "Relatório da etapa III",
    ]
    while len(t2.rows) < 1 + len(cron):
        t2.add_row()
    for i, (nome, etapa, idxs) in enumerate(cron):
        marcas = ", ".join(semanas[k] for k in idxs)
        estado = situacao.get(i, "Prevista")
        t2.rows[i + 1].cells[0].text = nome
        t2.rows[i + 1].cells[1].text = etapa
        t2.rows[i + 1].cells[2].text = marcas
        t2.rows[i + 1].cells[3].text = estado
        t2.rows[i + 1].cells[4].text = produto[i]

    doc.save(str(OUT))
    print(OUT)


if __name__ == "__main__":
    main()
