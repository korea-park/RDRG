import React, { ChangeEvent, useEffect, useState } from 'react'
import "./style.css";
import { useNavigate } from 'react-router';
import { AUTH_ABSOLUTE_PATH, HOME_ABSOLUTE_PATH, HOME_PATH, MYPAGE_UNREGISTER_ABSOLUTE_PATH } from 'src/constants';
import InputBox from 'src/components/Inputbox';
import { useCookies } from 'react-cookie';
import { PersonalInfoResponseDto } from 'src/apis/user/dto/response';
import ResponseDto from 'src/apis/response.dto';
import { getUserInfoRequest } from 'src/apis/user';

//                    component                    //
export default function MypageProfile() {
  
  //                    state                    //
  const [userId, setUserId] = useState<string>(() => localStorage.getItem('userId') || '');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('userEmail') || '');
  const [cookies, setCookie, removeCookie ] = useCookies();

  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordCheck, setNewPasswordCheck] = useState<string>('');
  const [isPasswordPattern, setPasswordPattern] = useState<boolean>(false);
  const [isEqualPassword, setEqualPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<string>('');
  const [passwordCheckMessage, setPasswordCheckMessage] = useState<string>('');
  
  const [message, setMessage] = useState<string>('');

  //                    function                    //
  const navigator = useNavigate();

  const personalInfoResponseDto = (result: PersonalInfoResponseDto | ResponseDto | null) => {
  
    const message =
      !result ? '서버에 문제가 있습니다.' :
      result.code === 'VF' ? '잘못된 회원정보입니다.' :
      result.code === 'AF' ? '인증에 실패했습니다.' :
      result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

    if (!result || result.code !== 'SU') {

      alert(message);
      if (result?.code === 'AF') navigator(HOME_PATH); return;
    }

    const {userId, userEmail} = result as PersonalInfoResponseDto;

    setUserId(userId);
    setUserEmail(userEmail);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', userEmail);
  };


  //                     effect                    //

  useEffect(() => {
    if (!cookies.accessToken) {
        // accessToken이 없으면 로컬 스토리지를 초기화하고 홈 페이지로 이동
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setUserId('');
        setUserEmail('');
        
        navigator(AUTH_ABSOLUTE_PATH);
        return;
    }

        getUserInfoRequest(userId, cookies.accessToken).then(personalInfoResponseDto);

    }, [cookies.accessToken, userId]);

  //                    event handler                    //


  // 회원탈퇴 버튼 클릭 시 회원탈퇴 페이지로 이동
  const onUnRegisterClickHandler = () => {navigator(MYPAGE_UNREGISTER_ABSOLUTE_PATH)};

  // 현재 비밀번호 입력
  const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setMessage('');
  };
  
  // 새 비밀번호 입력
  const onNewPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNewPassword(value);

    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,13}$/;
    const isPasswordPattern = passwordPattern.test(value);
    setPasswordPattern(isPasswordPattern);

    const passwordMessage = 
        isPasswordPattern ? '' : 
        value ? '영문, 숫자를 혼용하여 8 ~ 13자 입력해주세요.' : '';
    setPasswordMessage(passwordMessage);
    
    const isEqualPassword = newPasswordCheck === value;
    setEqualPassword(isEqualPassword);

    const passwordCheckMessage = 
        isEqualPassword ? '' : 
        newPasswordCheck ? '비밀번호가 일치하지 않습니다.' : '';
    setPasswordCheckMessage(passwordCheckMessage);
  };

  // 새 비밀번호 확인
  const onNewPasswordCheckChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNewPasswordCheck(value);

    const isEqualPassword = newPassword === value;
    setEqualPassword(isEqualPassword);

    const passwordCheckMessage = 
        isEqualPassword ? '' : 
        value ? '비밀번호가 일치하지 않습니다.' : '';
    setPasswordCheckMessage(passwordCheckMessage);
  };

  //                    render                    //
  return (
    <div id='mypage-profile-wrapper'>
      <div className='profile-title'>프로필 관리</div>
      <div className='profile-detail'>
        <div className='profile-detail-content'>
          <div className='profile-detail-title'>아이디</div>
          <div>{userId}</div>
        </div>
        <div className='profile-detail-content'>
          <div className='profile-detail-title'>이메일</div>
          <div>{userEmail}</div>
        </div>
        <div className='profile-detail-content'>
          <div className='profile-detail-title'>비밀번호</div>
          <div className='profile-detail-password-input-container'>
            <InputBox label="현재 비밀번호" type="password" value={password} placeholder="현재 비밀번호를 입력해주세요" onChangeHandler={onPasswordChangeHandler} message={message} error />
            <InputBox  label="새비밀번호" type="password" value={newPassword} placeholder="새비밀번호를 입력해주세요" 
              onChangeHandler={onNewPasswordChangeHandler} message={passwordMessage} error />
            <InputBox label="비밀번호 확인" type="password" value={newPasswordCheck} placeholder="새비밀번호를 입력해주세요" 
              onChangeHandler={onNewPasswordCheckChangeHandler} message={passwordCheckMessage} error />
          </div>
        </div>
      </div>
      <div className='profile-button-container'>
        <div className='unregister-button' onClick={onUnRegisterClickHandler}>회원탈퇴</div>
        <div className='change-button'>변경완료</div>
      </div>
    </div>
  )
}
