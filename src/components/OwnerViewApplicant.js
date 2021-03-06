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

import { Ionicons } from '@expo/vector-icons';

import { translate, translateFreeform } from '../utils/internationalization';
import ApplicationStatus from './ApplicationStatus.js';
import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import FacebookContactButton from './FacebookContactButton.js';
import FlagButton from './FlagButton';
import MapWithCircle from './MapWithCircle';
import SharedStyles from '../styles/SharedStyles';
import Time from './Time';
import TitleAndIcon from './TitleAndIcon.js';

import Hyperlink from 'react-native-hyperlink';

export default class OwnerViewApplicant extends React.Component {
	acceptApplicant = () => {
		Alert.alert(
			translate('Are you sure you want to accept?'),
			translate('This person will be able to view your Facebook Profile'),
			[
				{ text: translate('No') },
				{
					text: translate('Yes'),
					onPress: () => {
						this.props.appStatusChange(this.props.application, 'Accepted');
					}
				}
			],
			{ cancelable: false }
		);
	};

	rejectApplicant = () => {
		//TODO: translate
		Alert.alert(
			translate('Are you sure you want to reject?'),
			translate('This person will not be able to contact you'),
			[
				{ text: translate('No') },
				{
					text: translate('Yes'),
					onPress: () => {
						this.props.appStatusChange(this.props.application, 'Rejected');
					}
				}
			],
			{ cancelable: false }
		);
	};

	render() {
		return (
			<View style={[SharedStyles.modalContent, { backgroundColor: 'white' }]}>
				<TouchableOpacity onPress={this.props.back} style={SharedStyles.back}>
					<Ionicons
						name={I18nManager.isRTL ? 'ios-arrow-forward' : 'ios-arrow-back'}
						size={42}
					/>
				</TouchableOpacity>

				<ExitBar />

				<ScrollView keyboardShouldPersistTaps={'handled'}>
					<View style={styles.container}>
						<TitleAndIcon post={this.props.post} />
						<ApplicationStatus
							status={this.props.application.status}
							modal={true}
						/>

						<View style={SharedStyles.divider} />

						<Text style={styles.name}>
							{translate('Name') + ': '}
							{this.props.application.applicantInfo.displayName}
						</Text>

						<View style={SharedStyles.divider} />
						<Hyperlink linkDefault={true} linkStyle={SharedStyles.hyperlink}>
							<Text style={SharedStyles.message}>
								{translate('Response') + ': '}
								{translateFreeform(this.props.application.message)}
							</Text>
						</Hyperlink>

						<View style={SharedStyles.divider} />

						{this.props.application.status === 'Waiting For Response'
							? <View style={styles.acceptRejectContainer}>
									<TouchableOpacity
										style={styles.acceptRejectButton}
										onPress={() => {
											this.acceptApplicant();
										}}
									>
										<Text style={styles.acceptText}>
											{translate('Accept')}
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.acceptRejectButton}
										onPress={() => {
											this.rejectApplicant();
										}}
									>
										<Text style={styles.rejectText}>
											{translate('Reject')}
										</Text>
									</TouchableOpacity>
								</View>
							: null}

						<Time dates={this.props.post.dates} />
						<View style={SharedStyles.divider} />
						<MapWithCircle
							style={{ flex: 1 }}
							exactLocation={this.props.post.exactLocation}
							icon={this.props.post.icon}
							latitude={this.props.post.latitude}
							longitude={this.props.post.longitude}
						/>
						<FlagButton
							applicationID={this.props.application.key}
							flaggedUser={this.props.application.applicant}
						/>
					</View>
				</ScrollView>
				<FacebookContactButton
					owner={this.props.application.applicantInfo}
					description={'Contact'}
				/>
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
	name: {
		color: 'black',
		textAlign: 'center',
		fontSize: 18,
		marginTop: 10,
		marginBottom: 10
	},
	acceptRejectContainer: {
		flexDirection: 'row',
		width: '80%',
		justifyContent: 'space-around',
		paddingTop: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderColor: Colors.grey.medium
	},
	acceptRejectButton: {
		backgroundColor: Colors.grey.light,
		height: 50,
		width: '45%',
		borderRadius: 10,
		borderColor: Colors.grey.medium,
		borderWidth: 1,
		justifyContent: 'center',
		marginRight: 5,
		marginLeft: 5
	},
	acceptText: {
		color: 'green',
		alignSelf: 'center',
		fontSize: 18
	},
	rejectText: {
		color: 'red',
		alignSelf: 'center',
		fontSize: 18
	}
});
