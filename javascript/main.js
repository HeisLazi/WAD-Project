// Run when the page is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    var currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'polls.html' || currentPage === '') {
        initPolls();
    } else if (currentPage === 'memes.html') {
        initMemes();
    }

    highlightActiveNav();
});

// Highlight the active page in the nav bar
function highlightActiveNav() {
    var currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '') currentPage = 'index.html';

    var links = document.querySelectorAll('nav a');

    for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href');
        if (href === currentPage) {
            links[i].classList.add('active');
        } else {
            links[i].classList.remove('active');
        }
    }
}

// ========== POLLS ==========

// Setup polls page
function initPolls() {
    var pollContainer = document.getElementById('poll-container');
    if (!pollContainer) return;

    showLoading(pollContainer);

    fetch('php/fetch_polls.php')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success && data.polls.length > 0) {
                showPolls(data.polls);
            } else {
                showMessage('No polls available right now.', 'info', pollContainer);
            }
        })
        .catch(function(error) {
            console.log('Error loading polls:', error);
            showMessage('Could not load polls.', 'error', pollContainer);
        });
}

// Show all polls
function showPolls(polls) {
    var container = document.getElementById('poll-container');
    container.innerHTML = '';

    for (var i = 0; i < polls.length; i++) {
        var card = makePollCard(polls[i]);
        container.appendChild(card);
    }
}

// Make one poll card
function makePollCard(poll) {
    var card = document.createElement('div');
    card.className = 'poll-card';
    card.id = 'poll-' + poll.id;

    var hasVoted = localStorage.getItem('voted_poll_' + poll.id) === 'true';

    var html = '';
    html += '<h3>' + escapeHtml(poll.question) + '</h3>';
    html += '<div class="poll-options">';

    html += '<div class="poll-option">';
    html += '<button onclick="vote(' + poll.id + ', 1)" ' + (hasVoted ? 'disabled' : '') + '>Vote</button>';
    html += '<span class="option-label">' + escapeHtml(poll.option1) + '</span>';
    html += '</div>';

    html += '<div class="poll-option">';
    html += '<button onclick="vote(' + poll.id + ', 2)" ' + (hasVoted ? 'disabled' : '') + '>Vote</button>';
    html += '<span class="option-label">' + escapeHtml(poll.option2) + '</span>';
    html += '</div>';

    html += '</div>';

    html += '<div class="progress-container ' + (hasVoted ? 'show' : '') + '" id="progress-' + poll.id + '">';
    html += '<div class="progress-item">';
    html += '<div class="progress-label">';
    html += '<span>' + escapeHtml(poll.option1) + '</span>';
    html += '<span id="votes1-' + poll.id + '">' + poll.votes1 + ' votes (' + poll.percentage1 + '%)</span>';
    html += '</div>';
    html += '<div class="progress-bar-container">';
    html += '<div class="progress-bar" style="width:' + poll.percentage1 + '%"></div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="progress-item">';
    html += '<div class="progress-label">';
    html += '<span>' + escapeHtml(poll.option2) + '</span>';
    html += '<span id="votes2-' + poll.id + '">' + poll.votes2 + ' votes (' + poll.percentage2 + '%)</span>';
    html += '</div>';
    html += '<div class="progress-bar-container">';
    html += '<div class="progress-bar" style="width:' + poll.percentage2 + '%"></div>';
    html += '</div>';
    html += '</div>';

    html += '<p style="text-align:center; margin-top:1rem; color:#7f8c8d;">Total votes: <strong id="total-' + poll.id + '">' + poll.totalVotes + '</strong></p>';
    html += '</div>';

    card.innerHTML = html;
    return card;
}

// Vote in a poll
function vote(pollId, option) {
    if (localStorage.getItem('voted_poll_' + pollId) === 'true') {
        alert('You already voted!');
        return;
    }

    var formData = new FormData();
    formData.append('poll_id', pollId);
    formData.append('option', option);

    var pollCard = document.getElementById('poll-' + pollId);
    var buttons = pollCard.querySelectorAll('button');

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }

    fetch('php/vote.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            localStorage.setItem('voted_poll_' + pollId, 'true');
            updatePoll(pollId, data.poll);
            showTemporaryMessage('Vote recorded!', 'success', pollCard);
        } else {
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].disabled = false;
            }
            alert('Error: ' + data.message);
        }
    })
    .catch(function(error) {
        console.log('Error voting:', error);
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
        }
        alert('Could not vote. Try again.');
    });
}

// Update poll results after vote
function updatePoll(pollId, pollData) {
    var container = document.getElementById('progress-' + pollId);
    container.classList.add('show');

    document.getElementById('votes1-' + pollId).textContent = pollData.votes1 + ' votes (' + pollData.percentage1 + '%)';
    document.getElementById('votes2-' + pollId).textContent = pollData.votes2 + ' votes (' + pollData.percentage2 + '%)';
    document.getElementById('total-' + pollId).textContent = pollData.totalVotes;

    var bars = container.querySelectorAll('.progress-bar');
    bars[0].style.width = pollData.percentage1 + '%';
    bars[1].style.width = pollData.percentage2 + '%';
}

// ========== MEMES ==========

// Setup memes page
function initMemes() {
    var form = document.getElementById('upload-form');
    var gallery = document.getElementById('meme-gallery');

    if (!gallery) return;

    loadMemes();

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadMeme();
        });
    }
}

// Load memes from server
function loadMemes() {
    var gallery = document.getElementById('meme-gallery');
    showLoading(gallery);

    fetch('php/display_memes.php')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success && data.memes.length > 0) {
                showMemes(data.memes);
            } else {
                gallery.innerHTML = '<p class="message info">No memes uploaded yet.</p>';
            }
        })
        .catch(function(error) {
            console.log('Error loading memes:', error);
            showMessage('Could not load memes.', 'error', gallery);
        });
}

// Show memes on page
function showMemes(memes) {
    var gallery = document.getElementById('meme-gallery');
    gallery.innerHTML = '';

    for (var i = 0; i < memes.length; i++) {
        var item = document.createElement('div');
        item.className = 'meme-item';
        item.innerHTML =
            '<img src="' + escapeHtml(memes[i].path) + '" alt="Meme">' +
            '<div class="meme-info"><
