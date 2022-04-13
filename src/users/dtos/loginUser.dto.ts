import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

class LoginUserDto {
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	public userId: string

	@IsString()
	@IsNotEmpty()
	public password: string
}

export default LoginUserDto
