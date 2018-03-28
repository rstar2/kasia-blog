const keystone = require('keystone');

function signin (req, res) {
	// username/password are obligatory
	if (!req.body.username || !req.body.password) {
		return res.apiError('Missing credentials');
	}

	// check the user first
	keystone.list('User').model
		.findOne({ email: req.body.username })
		.exec(function (err, user) {
			if (err) {
				return res.apiError('Sorry, there was an issue signing you in, please try again.', err);
			}

			if (!user) {
				return res.apiError('Invalid credentials');
			}

			// sign-in - create valid session
			keystone.session.signin({ email: user.email, password: req.body.password }, req, res, function (user) {
				return res.apiResponse({ success: true });
			}, function (err) {
				return res.apiError('Sorry, there was an issue signing you in, please try again.', err);
			});
		});
}

// you'll want one for signout too
function signout (req, res) {
	keystone.session.signout(req, res, function () {
		res.apiResponse({ success: true });
	});
}

const router = keystone.createRouter();

router.post('/signin', signin);
router.get('/signout', signout);

module.exports = router;
