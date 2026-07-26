function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'health').trim();

    if (action === 'health') {
      return jsonOutput_({
        ok: true,
        service: CONFIG.APP_NAME,
        status: 'online',
        timestamp: nowIso_(),
        timezone: CONFIG.TIMEZONE
      });
    }

    return jsonOutput_(errorPayload_(
      'METHOD_NOT_ALLOWED',
      'Utilice POST para consumir la API.'
    ));
  } catch (error) {
    return jsonOutput_(handleError_(error));
  }
}

function doPost(e) {
  try {
    ensureInitialized_();

    const request = parseRequest_(e);
    const action = requireString_(request.action, 'action', 2, 100);
    const data = isPlainObject_(request.data) ? request.data : request;

    if (action !== 'health') {
      assertBackendApiKey_(request);
    }

    let result;

    switch (action) {
      case 'health':
        result = {
          service: CONFIG.APP_NAME,
          status: 'online',
          timestamp: nowIso_(),
          timezone: CONFIG.TIMEZONE
        };
        break;

      case 'admin.login':
        result = adminLogin_(data);
        break;
      case 'admin.logout':
        result = adminLogout_(request, data);
        break;
      case 'admin.me':
        result = adminMe_(request);
        break;
      case 'admin.changePassword':
        result = adminChangePassword_(request, data);
        break;

      case 'questions.list':
        result = questionsList_(request, data);
        break;
      case 'questions.get':
        result = questionsGet_(request, data);
        break;
      case 'questions.create':
        result = questionsCreate_(request, data);
        break;
      case 'questions.update':
        result = questionsUpdate_(request, data);
        break;
      case 'questions.delete':
        result = questionsDelete_(request, data);
        break;

      case 'sessions.list':
        result = sessionsList_(request, data);
        break;
      case 'sessions.get':
        result = sessionsGet_(request, data);
        break;
      case 'sessions.create':
        result = sessionsCreate_(request, data);
        break;
      case 'sessions.update':
        result = sessionsUpdate_(request, data);
        break;
      case 'sessions.setQuestions':
        result = sessionsSetQuestions_(request, data);
        break;
      case 'sessions.open':
        result = sessionsOpen_(request, data);
        break;
      case 'sessions.close':
        result = sessionsClose_(request, data);
        break;
      case 'sessions.delete':
        result = sessionsDelete_(request, data);
        break;
      case 'sessions.results':
        result = sessionsResults_(request, data);
        break;
      case 'sessions.participantAnswers':
        result = sessionsParticipantAnswers_(request, data);
        break;

      case 'public.session':
        result = publicSession_(data);
        break;
      case 'guest.join':
        result = guestJoin_(data);
        break;
      case 'guest.quiz':
        result = guestQuiz_(request);
        break;
      case 'guest.answer':
        result = guestAnswer_(request, data);
        break;
      case 'guest.progress':
        result = guestProgress_(request);
        break;

      default:
        throw apiError_('UNKNOWN_ACTION', 'La acción solicitada no existe.');
    }

    return jsonOutput_({
      ok: true,
      action: action,
      data: normalizeForJson_(result),
      timestamp: nowIso_()
    });
  } catch (error) {
    return jsonOutput_(handleError_(error));
  }
}
