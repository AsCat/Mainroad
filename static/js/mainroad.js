'use strict'

const MainRoad = {}

MainRoad.backToTop = function () {
	const $backToTop = $('#back-to-top')

	$(window).scroll(function () {
		if ($(window).scrollTop() > 100) {
			$backToTop.fadeIn(1000)
		} else {
			$backToTop.fadeOut(1000)
		}
	})

	$backToTop.click(function () {
		$('body,html').animate({ scrollTop: 0 })
	})
}

MainRoad.mobileNavbar = function () {
	const $mobileNav = $('#mobile-navbar')
	const $mobileNavIcon = $('.mobile-navbar-icon')
	const slideout = new Slideout({
		'panel': document.getElementById('mobile-panel'),
		'menu': document.getElementById('mobile-menu'),
		'padding': 180,
		'tolerance': 70
	})
	slideout.disableTouch()

	$mobileNavIcon.click(function () {
		slideout.toggle()
	})

	slideout.on('beforeopen', function () {
		$mobileNav.addClass('fixed-open')
		$mobileNavIcon.addClass('icon-click').removeClass('icon-out')
	})

	slideout.on('beforeclose', function () {
		$mobileNav.removeClass('fixed-open')
		$mobileNavIcon.addClass('icon-out').removeClass('icon-click')
	})

	$('#mobile-panel').on('touchend', function () {
		slideout.isOpen() && $mobileNavIcon.click()
	})
}

MainRoad._initToc = function () {
	const SPACING = 15
	const $toc = $('#post-toc')
	const $footer = $('#post-footer')

	console.log($toc);
	console.log($footer);

	// console.log('----1');

	if ($toc.length) {

		// console.log('----2');

		const minScrollTop = $toc.offset().top - SPACING
		const maxScrollTop = $footer.offset().top - $toc.height() - SPACING

		const tocState = {
			start: {
				'position': 'absolute',
				'top': minScrollTop
			},
			process: {
				'position': 'fixed',
				'top': SPACING
			},
			end: {
				'position': 'absolute',
				'top': maxScrollTop
			}
		}

		$(window).scroll(function () {
			// console.log('----');
			const scrollTop = $(window).scrollTop()

			if (scrollTop < minScrollTop) {
				$toc.css(tocState.start)
			} else if (scrollTop > maxScrollTop) {
				$toc.css(tocState.end)
			} else {
				$toc.css(tocState.process)
			}
		})
	}

	const HEADERFIX = 30
	const $toclink = $('.toc-link')
	const $headerlink = $('.headerlink')
	const $tocLinkLis = $('.post-toc-content li')

	console.log($toclink);
	console.log($headerlink);
	console.log($tocLinkLis);

	const headerlinkTop = $.map($headerlink, function (link) {
		return $(link).offset().top
	})

	const headerLinksOffsetForSearch = $.map(headerlinkTop, function (offset) {
		return offset - HEADERFIX
	})

	const searchActiveTocIndex = function (array, target) {
		for (let i = 0; i < array.length - 1; i++) {
			if (target > array[i] && target <= array[i + 1]) return i
		}
		if (target > array[array.length - 1]) return array.length - 1
		return -1
	}

	$(window).scroll(function () {
		const scrollTop = $(window).scrollTop()
		const activeTocIndex = searchActiveTocIndex(headerLinksOffsetForSearch, scrollTop)

		$($toclink).removeClass('active')
		$($tocLinkLis).removeClass('has-active')

		if (activeTocIndex !== -1) {
			console.log('sš33');
			$($toclink[activeTocIndex]).addClass('active')
			let ancestor = $toclink[activeTocIndex].parentNode
			while (ancestor.tagName !== 'NAV') {
				$(ancestor).addClass('has-active')
				ancestor = ancestor.parentNode.parentNode
			}
		}
	})
}

MainRoad.fancybox = function () {
	if ($.fancybox) {
		$('.post-content').each(function () {
			$(this).find('img').each(function () {
				$(this).wrap(`<a class="fancybox" href="${this.src}" data-fancybox="gallery" data-caption="${this.title}"></a>`)
			})
		})

		$('.fancybox').fancybox({
			selector: '.fancybox',
			protect: true
		})
	}
}

MainRoad.highlight = function () {
	const blocks = document.querySelectorAll('pre code')
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i]
		const rootElement = block.parentElement
		const lineCodes = block.innerHTML.split(/\n/)
		if (lineCodes[lineCodes.length - 1] === '') lineCodes.pop()
		const lineLength = lineCodes.length

		let codeLineHtml = ''
		for (let i = 0; i < lineLength; i++) {
			codeLineHtml += `<div class="line">${i + 1}</div>`
		}

		let codeHtml = ''
		for (let i = 0; i < lineLength; i++) {
			codeHtml += `<div class="line">${lineCodes[i]}</div>`
		}

		block.className += ' highlight'
		const figure = document.createElement('figure')
		figure.className = block.className
		figure.innerHTML = `<table><tbody><tr><td class="gutter"><pre>${codeLineHtml}</pre></td><td class="code"><pre>${codeHtml}</pre></td></tr></tbody></table>`

		rootElement.parentElement.replaceChild(figure, rootElement)
	}
}

MainRoad.toc = function () {
	const tocContainer = document.getElementById('post-toc')
	console.log(tocContainer);

	if (tocContainer !== null) {
		const toc = document.getElementById('TableOfContents')
		if (toc === null) {
			// toc = true, but there are no headings
			tocContainer.parentNode.removeChild(tocContainer)
		} else {
			this._refactorToc(toc)
			this._linkToc()
			this._initToc()
		}
	}
}

MainRoad._refactorToc = function (toc) {
	// when headings do not start with `h1`
	const oldTocList = toc.children[0]
	let newTocList = oldTocList
	let temp
	while (newTocList.children.length === 1 && (temp = newTocList.children[0].children[0]).tagName === 'UL') newTocList = temp

	if (newTocList !== oldTocList) toc.replaceChild(newTocList, oldTocList)
}

MainRoad._linkToc = function () {
	const links = document.querySelectorAll('#TableOfContents a:first-child')
	for (let i = 0; i < links.length; i++) links[i].className += ' toc-link'

	for (let num = 1; num <= 6; num++) {
		const headers = document.querySelectorAll('.post__content>h' + num)
		for (let i = 0; i < headers.length; i++) {
			const header = headers[i]
			header.innerHTML = `<a href="#${header.id}" class="headerlink"></a>${header.innerHTML}`
		}
	}
}

MainRoad.flowchart = function () {
	if (!window.flowchart) return

	const blocks = document.querySelectorAll('pre code.language-flowchart')
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i]
		const rootElement = block.parentElement

		const container = document.createElement('div')
		const id = `js-flowchart-diagrams-${i}`
		container.id = id
		container.className = 'align-center'
		rootElement.parentElement.replaceChild(container, rootElement)

		const diagram = flowchart.parse(block.childNodes[0].nodeValue)
		diagram.drawSVG(id, window.flowchartDiagramsOptions ? window.flowchartDiagramsOptions : {})
	}
}

MainRoad.sequence = function () {
	if (!window.Diagram) return

	const blocks = document.querySelectorAll('pre code.language-sequence')
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i]
		const rootElement = block.parentElement

		const container = document.createElement('div')
		const id = `js-sequence-diagrams-${i}`
		container.id = id
		container.className = 'align-center'
		rootElement.parentElement.replaceChild(container, rootElement)

		const diagram = Diagram.parse(block.childNodes[0].nodeValue)
		diagram.drawSVG(id, window.sequenceDiagramsOptions ? window.sequenceDiagramsOptions : {theme: 'simple'})
	}
}

$(document).ready(function () {
	MainRoad.toc()
})
