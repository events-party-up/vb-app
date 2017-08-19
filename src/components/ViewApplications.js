import {
	ActivityIndicator,
	FlatList,
	I18nManager,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';
import * as firebase from 'firebase';

import { Ionicons } from '@expo/vector-icons';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import { translate } from '../utils/internationalization';
import ApplicationStatus from './ApplicationStatus';
import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import FacebookProfileIcon from './FacebookProfileIcon';
import OwnerViewApplicant from './OwnerViewApplicant';
import pushNotify from '../utils/pushNotify';

export default class ViewApplications extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			applications: [],
			applicantClicked: false,
			applicant: null,
			applicationsLoaded: false
		};
	}

	componentDidMount() {
		// Load all of the applications of this post, only if the set of
		// applications is non empty.
		Promise.all(
			Object.keys(this.props.post.applications).map(this._getApplicationByKey)
		).then(applications => {
			this.setState({ applications: applications, applicationsLoaded: true });
		});
	}

	/**
	 * @param {String} applicationKey The unique database key which identifies the application
	 * @returns {Object} Returns the data about the application, as well as info
	 * about the applicant and their name from the Facebook graph API.
	 */
	_getApplicationByKey = async applicationKey => {
		let application = (await firebase
			.database()
			.ref('applications')
			.child(applicationKey)
			.once('value')).val();
		application.key = applicationKey;

		// get facebook applicationID from firebase
		application.applicantInfo = (await firebase
			.database()
			.ref('users')
			.child(application.applicant)
			.once('value')).val();
		return application;
	};

	changeApplicantStatus = async (application, status) => {
		// TODO setting status on an application that has been deleted creates an
		// orphaned application
		await firebase
			.database()
			.ref('applications')
			.child(application.key)
			.child('status')
			.set(status);
		// keep local data updated
		application.status = status;

		if (status === 'Accepted') {
			firebase
				.database()
				.ref('users/' + application.applicant + '/pushToken')
				.once('value', function(snap) {
					console.log('Push notifying', snap.val());
					pushNotify(
						snap.val(),
						'Your application to an event has been accepted!',
						{
							type: 'applicantAccepted',
							post: application.post,
							uid: firebase.auth().currentUser.uid
						}
					);
				});
		}
		this.forceUpdate();
	};

	_applicantClicked = application => {
		this.setState({ applicantClicked: true, applicant: application });
	};

	_hideApplicant = () => {
		this.setState({ applicantClicked: false });
	};

	renderApplication(application) {
		return (
			<TouchableOpacity
				style={styles.applicationContainer}
				onPress={() => {
					this._applicantClicked(application);
				}}
			>
				<View alignSelf={'center'}>
					<FacebookProfileIcon
						{...application.applicantInfo}
						style={styles.iconContainer}
						button={false}
					/>
				</View>
				<View style={styles.nameStatusContainer} flex={1}>
					<Text style={styles.name}>
						{application.applicantInfo.displayName}
					</Text>
					<ApplicationStatus status={application.status} />
				</View>
				<View style={styles.iconContainer}>
					<Ionicons
						name={
							I18nManager.isRTL
								? 'ios-arrow-back-outline'
								: 'ios-arrow-forward-outline'
						}
						size={40}
						color={Colors.grey.medium}
					/>
				</View>
			</TouchableOpacity>
		);
	}

	// function: applicantList
	// ---------------------------------
	// Returns a Flatlist containing applicants from the data source passed in
	applicantList = listData => {
		return this.state.applicationsLoaded
			? listData.length === 0
				? <Text style={{ alignSelf: 'center', marginTop: 10 }}>
						{translate('There are no applications to display')}
					</Text>
				: //actually render flatlist
					<FlatList
						data={listData}
						ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
						renderItem={({ item }) => this.renderApplication(item)}
					/>
			: <View style={{ justifyContent: 'center', marginTop: 10 }}>
					<ActivityIndicator animating={true} size={'large'} />
				</View>;
	};

	render() {
		return this.state.applicantClicked
			? <OwnerViewApplicant
					application={this.state.applicant}
					back={this._hideApplicant}
					hide={this.props.hide}
					post={this.props.post}
					appStatusChange={this.changeApplicantStatus}
				/>
			: <View style={styles.container}>
					<ExitBar
						hide={this.props.hide}
						title={translate('View Applicants')}
					/>
					<Text style={styles.title}>
						{this.props.post.title}
					</Text>

					<View style={styles.applicantsTextStyle}>
						<Text style={styles.applicantsText}>
							{'APPLICANTS' /* TODO translate */}
						</Text>
					</View>
					<View style={SharedStyles.divider} />

					{this.applicantList(this.state.applications)}
				</View>;
	}
}

const styles = StyleSheet.create({
	applicantsText: {
		fontSize: 14,
		color: Colors.grey.dark,
		alignSelf: 'flex-start'
	},
	applicantsTextStyle: {
		width: '80%',
		marginTop: 10,
		alignSelf: 'center',
		marginBottom: 5
	},
	nameStatusContainer: {
		flexDirection: 'column',
		justifyContent: 'flex-start',
		marginLeft: 10
	},
	name: {
		color: 'black',
		fontSize: 20
	},
	applicationContainer: {
		flexDirection: 'row',
		margin: 10,
		paddingTop: 0,
		paddingBottom: 0,
		width: '80%',
		justifyContent: 'space-between',
		flex: 1,
		alignSelf: 'center'
	},
	iconContainer: {
		justifyContent: 'center'
	},
	container: {
		flex: 1,
		// padding: 10,
		backgroundColor: Colors.white
	},
	title: {
		fontSize: 26,
		fontWeight: '600',
		alignItems: 'center',
		textAlign: 'center',
		marginTop: 35,
		margin: 8,
		color: 'black'
	}
});
