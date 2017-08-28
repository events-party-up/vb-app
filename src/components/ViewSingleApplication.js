import {
	Alert,
	I18nManager,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';
import firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';

import { deleteApplication } from '../utils/ApplicationManager';
import { translate, translateFreeform } from '../utils/internationalization';
import ApplicationStatus from './ApplicationStatus';
import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import FacebookContactButton from './FacebookContactButton.js';
import MapWithCircle from './MapWithCircle';
import SharedStyles from '../styles/SharedStyles';
import Time from './Time';
import TitleAndIcon from './TitleAndIcon.js';
import pushNotify from '../utils/pushNotify';

export default class ViewSingleApplication extends React.Component {
	constructor(props) {
		super(props);
	}

	removeListing = () => {
		deleteApplication(this.props.app);
		this.props.hide();
	};

	_deleteApp = () => {
		Alert.alert(
			translate('Are you sure you want to remove this reply?'),
			translate('This cannot be undone'),
			[
				{ text: translate('No') },
				{ text: translate('Yes'), onPress: this.removeListing }
			],
			{ cancelable: false }
		);
	};

	_sendReminder = () => {
		console.log('Reminding', this.props.app.postData.owner);
		firebase
			.database()
			.ref('users')
			.child(this.props.app.postData.owner)
			.child('pushToken')
			.once('value')
			.then(token => {
				// TODO make this open the exact application
				console.log('Push notifying', token.val(), this.props.app);
				pushNotify(
					token.val(),
					'Please review reply to your post',
					this.props.app.postData.title.original,
					{
						type: 'applicationSent'
					}
				);
			});
	};

	_remindOwner = () => {
		Alert.alert(
			translate('Remind Post Owner'),
			translate('Do to notify the post owner about your application again?'),
			[
				{ text: translate('No') },
				{ text: translate('Yes'), onPress: this._sendReminder }
			],
			{ cancelable: false }
		);
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<ExitBar hide={this.props.hide} />
				<ScrollView keyboardShouldPersistTaps={'handled'}>
					<View style={styles.container}>
						<TitleAndIcon post={this.props.app.postData} />

						<ApplicationStatus status={this.props.app.status} modal={true} />

						<View style={SharedStyles.divider} />

						<Text style={styles.description}>
							{translate('Event Description') + ':'}{' '}
							{translateFreeform(this.props.app.postData.description)}
						</Text>

						<View style={SharedStyles.divider} />

						<Text style={SharedStyles.message}>
							{translate('Your Reply') + ': '}
							{translateFreeform(this.props.app.message)}
						</Text>
						<View style={SharedStyles.divider} />
						<Time dates={this.props.app.postData.dates} />
						<View style={SharedStyles.divider} />
						<MapWithCircle
							style={{ flex: 1 }}
							latitude={this.props.app.postData.latitude}
							longitude={this.props.app.postData.longitude}
						/>

						<View style={styles.buttonBar}>
							<TouchableOpacity
								style={styles.bottomButton}
								onPress={this._deleteApp}
							>
								<FontAwesome name={'trash-o'} size={40} />
								<Text style={styles.buttonText}>
									{translate('Delete Reply')}
								</Text>
							</TouchableOpacity>

							{this.props.app.status === 'Waiting For Response'
								? <TouchableOpacity
										style={styles.bottomButton}
										onPress={this._remindOwner}
									>
										<FontAwesome
											name={I18nManager.isRTL ? 'hand-o-left' : 'hand-o-right'}
											size={40}
										/>
										<Text style={styles.buttonText}>
											{translate('Remind')}
										</Text>
									</TouchableOpacity>
								: null}
						</View>
					</View>
				</ScrollView>

				{/* Bottom bar that appears if application has been
					accepted to the event by owner */}
				{this.props.app.status === 'Accepted'
					? <FacebookContactButton
							owner={this.props.app.owner}
							description={'Contact Event Owner'}
						/>
					: null}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-around',
		backgroundColor: 'white',
		alignItems: 'center'
	},

	description: {
		textAlign: 'center', //Change to right for arabic/farsi
		color: 'black',
		margin: 15,
		marginLeft: 20,
		marginRight: 20,
		fontSize: 15
	},
	buttonBar: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 15
	},
	bottomButton: {
		flex: 1,
		backgroundColor: Colors.grey.light,
		paddingVertical: 5,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		margin: 10
	},
	buttonText: {
		fontSize: 18,
		paddingLeft: 5
	}
});
